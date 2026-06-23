import time
import os
import struct
import io
import urllib.parse
from PIL import Image
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, BackgroundTasks
from fastapi.responses import FileResponse
from backend.services import huffman, dct, video_codec, audio_codec
from backend.utils import file_handler, metrics

router = APIRouter()

def validate_file_size(file: UploadFile):
    """Checks if the uploaded file exceeds the 25MB size limit (TC-12)."""
    file.file.seek(0, 2)
    file_size = file.file.tell()
    file.file.seek(0)
    if file_size > 25 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="Ukuran berkas melebihi batasan maksimum 25MB.")

@router.post("/compress/huffman")
async def compress_huffman_endpoint(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...)
):
    background_tasks.add_task(file_handler.clean_old_temp_files)
    validate_file_size(file)
    
    # Read original file bytes
    file_bytes = await file.read()
    
    if len(file_bytes) == 0:
        raise HTTPException(status_code=400, detail="Cannot compress an empty file.")
    
    # Detect if the file is an image (PNG/BMP) by trying to open it with PIL
    is_image = False
    try:
        img = Image.open(io.BytesIO(file_bytes))
        img = img.convert("RGB")
        is_image = True
    except Exception:
        is_image = False
    
    start_time = time.time()
    
    if is_image:
        # For images: decode to raw RGB pixel bytes (uncompressed) for meaningful compression
        width, height = img.size
        raw_pixels = img.tobytes()  # Raw RGB bytes — much larger than PNG
        raw_size = len(raw_pixels)
        
        # Prepend image metadata header: Magic(4) + Width(2) + Height(2) = 8 bytes
        header = struct.pack(">4sHH", b"PVHI", width, height)
        payload = header + raw_pixels
        
        try:
            compressed_bytes = huffman.compress_bytes(payload)
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Huffman compression failed: {str(e)}")
        
        orig_size = raw_size  # Report raw pixel size as "original" for fair comparison
    else:
        # For non-image files (e.g., audio WAV): compress file bytes directly
        orig_size = len(file_bytes)
        try:
            compressed_bytes = huffman.compress_bytes(file_bytes)
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Huffman compression failed: {str(e)}")
        
    execution_time_ms = int((time.time() - start_time) * 1000)
    comp_size = len(compressed_bytes)
    
    # Save compressed bytes to temp file
    _, relative_url = file_handler.save_bytes_to_temp(compressed_bytes, ".huff")
    
    return {
        "status": "success",
        "original_size_bytes": orig_size,
        "compressed_size_bytes": comp_size,
        "compression_ratio": metrics.calculate_compression_ratio(orig_size, comp_size),
        "psnr_db": 99.0,  # Huffman is lossless — identical reconstruction
        "execution_time_ms": execution_time_ms,
        "download_url": relative_url
    }

@router.post("/decompress/huffman")
async def decompress_huffman_endpoint(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...)
):
    background_tasks.add_task(file_handler.clean_old_temp_files)
    validate_file_size(file)
    
    if not file.filename.endswith(".huff"):
        raise HTTPException(status_code=400, detail="Please upload a valid .huff file.")
        
    compressed_bytes = await file.read()
    compressed_size = len(compressed_bytes)
    
    start_time = time.time()
    try:
        decompressed_bytes = huffman.decompress_bytes(compressed_bytes)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Huffman decompression failed (file might be corrupted): {str(e)}")
        
    execution_time_ms = int((time.time() - start_time) * 1000)
    
    # Check if decompressed data contains our image header (PVHI magic)
    if len(decompressed_bytes) >= 8 and decompressed_bytes[:4] == b"PVHI":
        # Reconstruct image from raw pixel data
        _, width, height = struct.unpack(">4sHH", decompressed_bytes[:8])
        raw_pixels = decompressed_bytes[8:]
        decompressed_size = len(raw_pixels)
        
        try:
            img = Image.frombytes("RGB", (width, height), raw_pixels)
            output_buffer = io.BytesIO()
            img.save(output_buffer, format="PNG")
            result_bytes = output_buffer.getvalue()
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Image reconstruction failed: {str(e)}")
        
        ext = ".png"
    elif decompressed_bytes[:4] == b"RIFF":
        # WAV audio file
        result_bytes = decompressed_bytes
        decompressed_size = len(result_bytes)
        ext = ".wav"
    else:
        result_bytes = decompressed_bytes
        decompressed_size = len(result_bytes)
        ext = ".bin"
        
    _, relative_url = file_handler.save_bytes_to_temp(result_bytes, ext)
    
    return {
        "status": "success",
        "compressed_size_bytes": compressed_size,
        "decompressed_size_bytes": decompressed_size,
        "execution_time_ms": execution_time_ms,
        "download_url": relative_url
    }

@router.post("/compress/dct")
async def compress_dct_endpoint(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    quality: int = Form(85)
):
    background_tasks.add_task(file_handler.clean_old_temp_files)
    validate_file_size(file)
    
    # Read file
    file_bytes = await file.read()
    orig_size = len(file_bytes)
    
    if orig_size == 0:
        raise HTTPException(status_code=400, detail="Cannot compress an empty image.")
        
    start_time = time.time()
    try:
        compressed_bytes = dct.compress_image_dct(file_bytes, quality)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"DCT compression failed: {str(e)}")
        
    execution_time_ms = int((time.time() - start_time) * 1000)
    comp_size = len(compressed_bytes)
    
    # In order to calculate PSNR immediately, decompress in-memory
    try:
        recon_bytes, _ = dct.decompress_image_dct(compressed_bytes)
        psnr_db = metrics.calculate_psnr(file_bytes, recon_bytes)
    except Exception:
        psnr_db = 0.0  # fallback
        recon_bytes = file_bytes
        
    # Save the compressed DCT bytes to a .dct file
    _, download_url = file_handler.save_bytes_to_temp(compressed_bytes, ".dct")
    
    # Save reconstructed PNG image directly for standard user photo viewer display
    _, preview_url = file_handler.save_bytes_to_temp(recon_bytes, ".png")
    
    return {
        "status": "success",
        "original_size_bytes": orig_size,
        "compressed_size_bytes": comp_size,
        "decompressed_size_bytes": len(recon_bytes),
        "compression_ratio": metrics.calculate_compression_ratio(orig_size, comp_size),
        "psnr_db": psnr_db,
        "execution_time_ms": execution_time_ms,
        "download_url": download_url,
        "preview_url": preview_url
    }

@router.post("/decompress/dct")
async def decompress_dct_endpoint(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...)
):
    background_tasks.add_task(file_handler.clean_old_temp_files)
    validate_file_size(file)
    
    if not file.filename.endswith(".dct"):
        raise HTTPException(status_code=400, detail="Please upload a valid .dct file.")
        
    compressed_bytes = await file.read()
    compressed_size = len(compressed_bytes)
    
    start_time = time.time()
    try:
        recon_bytes, quality = dct.decompress_image_dct(compressed_bytes)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"DCT decompression failed: {str(e)}")
        
    execution_time_ms = int((time.time() - start_time) * 1000)
    decompressed_size = len(recon_bytes)
    
    _, relative_url = file_handler.save_bytes_to_temp(recon_bytes, ".png")
    
    return {
        "status": "success",
        "quality": quality,
        "compressed_size_bytes": compressed_size,
        "decompressed_size_bytes": decompressed_size,
        "execution_time_ms": execution_time_ms,
        "download_url": relative_url
    }

@router.post("/compress/audio")
async def compress_audio_endpoint(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    mode: str = Form("lossless")
):
    background_tasks.add_task(file_handler.clean_old_temp_files)
    validate_file_size(file)
    
    file_bytes = await file.read()
    orig_size = len(file_bytes)
    
    if orig_size == 0:
        raise HTTPException(status_code=400, detail="Cannot compress an empty audio file.")
        
    start_time = time.time()
    try:
        if mode == "lossy":
            compressed_bytes = audio_codec.downsample_audio(file_bytes, factor=2)
            ext = ".wav"
        else:
            compressed_bytes = huffman.compress_bytes(file_bytes)
            ext = ".huff"
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Audio compression failed: {str(e)}")
        
    execution_time_ms = int((time.time() - start_time) * 1000)
    comp_size = len(compressed_bytes)
    
    _, relative_url = file_handler.save_bytes_to_temp(compressed_bytes, ext)
    
    return {
        "status": "success",
        "original_size_bytes": orig_size,
        "compressed_size_bytes": comp_size,
        "compression_ratio": metrics.calculate_compression_ratio(orig_size, comp_size),
        "execution_time_ms": execution_time_ms,
        "download_url": relative_url
    }

@router.post("/decompress/audio")
async def decompress_audio_endpoint(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...)
):
    background_tasks.add_task(file_handler.clean_old_temp_files)
    validate_file_size(file)
    
    file_bytes = await file.read()
    if len(file_bytes) == 0:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")
        
    start_time = time.time()
    
    if file.filename.endswith(".huff"):
        try:
            decompressed_bytes = huffman.decompress_bytes(file_bytes)
            ext = ".wav"
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Huffman decompression failed: {str(e)}")
    elif file.filename.endswith(".wav"):
        decompressed_bytes = file_bytes
        ext = ".wav"
    else:
        raise HTTPException(status_code=400, detail="Unsupported file format for audio decompression.")
        
    execution_time_ms = int((time.time() - start_time) * 1000)
    
    _, relative_url = file_handler.save_bytes_to_temp(decompressed_bytes, ext)
    
    return {
        "status": "success",
        "execution_time_ms": execution_time_ms,
        "download_url": relative_url
    }

@router.post("/compress/video")
async def compress_video_endpoint(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    scale: float = Form(0.5),
    target_fps: int = Form(15)
):
    background_tasks.add_task(file_handler.clean_old_temp_files)
    validate_file_size(file)
    
    if not file.filename.lower().endswith(".avi"):
        raise HTTPException(status_code=400, detail="Only AVI format is supported for video compression.")
        
    input_path, _ = file_handler.save_temp_file(file)
    
    unique_out_name = f"compressed_{os.path.basename(input_path)}"
    output_path = os.path.join(file_handler.TEMP_DIR, unique_out_name)
    relative_url = f"/temp/{unique_out_name}"
    
    start_time = time.time()
    try:
        orig_size, comp_size = video_codec.compress_video_structural(
            input_path, output_path, scale, target_fps
        )
        psnr_db = video_codec.calculate_video_psnr(input_path, output_path)
    except Exception as e:
        if os.path.exists(input_path):
            os.remove(input_path)
        raise HTTPException(status_code=500, detail=f"Video compression failed: {str(e)}")
        
    execution_time_ms = int((time.time() - start_time) * 1000)
    
    if os.path.exists(input_path):
        os.remove(input_path)
        
    return {
        "status": "success",
        "original_size_bytes": orig_size,
        "compressed_size_bytes": comp_size,
        "compression_ratio": metrics.calculate_compression_ratio(orig_size, comp_size),
        "psnr_db": psnr_db,
        "execution_time_ms": execution_time_ms,
        "download_url": relative_url
    }

@router.post("/decompress/video")
async def decompress_video_endpoint(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...)
):
    background_tasks.add_task(file_handler.clean_old_temp_files)
    validate_file_size(file)
    
    if not file.filename.lower().endswith(".avi"):
        raise HTTPException(status_code=400, detail="Please upload a valid .avi file.")
        
    _, relative_url = file_handler.save_temp_file(file)
    
    return {
        "status": "success",
        "execution_time_ms": 0,
        "download_url": relative_url
    }

@router.get("/download")
async def download_file_endpoint(path: str):
    """
    Exposes a download endpoint that forces download by setting Content-Disposition: attachment.
    Path is the name of the file in the temp directory (e.g., 'uuid.ext').
    """
    # Prevent directory traversal by only taking the filename
    filename = os.path.basename(path)
    file_path = os.path.join(file_handler.TEMP_DIR, filename)
    
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Berkas tidak ditemukan.")
    
    # URL-encode the filename for Content-Disposition header to handle special chars properly
    encoded_filename = urllib.parse.quote(filename)
    headers = {
        "Content-Disposition": f"attachment; filename*=UTF-8''{encoded_filename}"
    }
    
    return FileResponse(
        path=file_path,
        media_type="application/octet-stream",
        filename=filename,
        headers=headers
    )

