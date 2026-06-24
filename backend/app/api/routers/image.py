import os
import uuid
from fastapi import APIRouter, UploadFile, File
from fastapi.responses import FileResponse
from app.utils.file_utils import save_upload_file, get_temp_path
from app.services.codec.huffman import compress_image_huffman, decompress_image_huffman
from app.db import update_stats

router = APIRouter()

@router.post("/compress")
async def compress_image(file: UploadFile = File(...)):
    # Simpan file yang diupload sementara
    input_path = save_upload_file(file)
    
    # Siapkan path output
    output_filename = f"compressed_{uuid.uuid4()}.huff"
    output_path = get_temp_path(output_filename)
    
    # Proses kompresi menggunakan Huffman
    compress_image_huffman(input_path, output_path)
    
    # Hitung metrik ukuran
    original_size = os.path.getsize(input_path)
    compressed_size = os.path.getsize(output_path)
    
    # Update statistik ke DB
    update_stats("image", "compress", original_size, compressed_size)
    
    return {
        "original_size": original_size,
        "compressed_size": compressed_size,
        "compression_ratio": round((compressed_size / original_size) * 100, 2),
        "download_url": f"/api/image/download/{output_filename}"
    }

@router.post("/decompress")
async def decompress_image(file: UploadFile = File(...)):
    input_path = save_upload_file(file)
    
    output_filename = f"decompressed_{uuid.uuid4()}.png"
    output_path = get_temp_path(output_filename)
    
    # Proses dekompresi
    decompress_image_huffman(input_path, output_path)
    
    update_stats("image", "decompress")
    
    return {
        "download_url": f"/api/image/download/{output_filename}"
    }

@router.get("/download/{filename}")
async def download_file(filename: str):
    file_path = get_temp_path(filename)
    return FileResponse(file_path, filename=filename)
