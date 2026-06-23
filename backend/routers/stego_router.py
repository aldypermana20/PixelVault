import time
import os
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, BackgroundTasks
from backend.services import lsb
from backend.utils import file_handler

router = APIRouter()

def validate_file_size(file: UploadFile):
    """Checks if the uploaded file exceeds the 25MB size limit (TC-12)."""
    file.file.seek(0, 2)
    file_size = file.file.tell()
    file.file.seek(0)
    if file_size > 25 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="Ukuran berkas melebihi batasan maksimum 25MB.")

@router.post("/stego/image/encode")
async def stego_image_encode_endpoint(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    message: str = Form(...)
):
    background_tasks.add_task(file_handler.clean_old_temp_files)
    validate_file_size(file)
    
    file_bytes = await file.read()
    if len(file_bytes) == 0:
        raise HTTPException(status_code=400, detail="Empty cover image uploaded.")
        
    start_time = time.time()
    try:
        stego_bytes = lsb.encode_image_lsb(file_bytes, message)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Image LSB encoding failed: {str(e)}")
        
    execution_time_ms = int((time.time() - start_time) * 1000)
    
    _, relative_url = file_handler.save_bytes_to_temp(stego_bytes, ".png")
    
    return {
        "status": "success",
        "execution_time_ms": execution_time_ms,
        "download_url": relative_url
    }

@router.post("/stego/image/decode")
async def stego_image_decode_endpoint(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...)
):
    background_tasks.add_task(file_handler.clean_old_temp_files)
    validate_file_size(file)
    
    file_bytes = await file.read()
    if len(file_bytes) == 0:
        raise HTTPException(status_code=400, detail="Empty stego image uploaded.")
        
    start_time = time.time()
    try:
        message = lsb.decode_image_lsb(file_bytes)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Image LSB decoding failed: {str(e)}")
        
    execution_time_ms = int((time.time() - start_time) * 1000)
    
    return {
        "status": "success",
        "message": message,
        "execution_time_ms": execution_time_ms
    }

@router.post("/stego/audio/encode")
async def stego_audio_encode_endpoint(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    message: str = Form(...)
):
    background_tasks.add_task(file_handler.clean_old_temp_files)
    validate_file_size(file)
    
    if not file.filename.endswith(".wav"):
        raise HTTPException(status_code=400, detail="Only WAV format is supported for audio steganography.")
        
    file_bytes = await file.read()
    if len(file_bytes) == 0:
        raise HTTPException(status_code=400, detail="Empty cover audio uploaded.")
        
    start_time = time.time()
    try:
        stego_bytes = lsb.encode_audio_lsb(file_bytes, message)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Audio LSB encoding failed: {str(e)}")
        
    execution_time_ms = int((time.time() - start_time) * 1000)
    
    _, relative_url = file_handler.save_bytes_to_temp(stego_bytes, ".wav")
    
    return {
        "status": "success",
        "execution_time_ms": execution_time_ms,
        "download_url": relative_url
    }

@router.post("/stego/audio/decode")
async def stego_audio_decode_endpoint(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...)
):
    background_tasks.add_task(file_handler.clean_old_temp_files)
    validate_file_size(file)
    
    if not file.filename.endswith(".wav"):
        raise HTTPException(status_code=400, detail="Please upload a valid .wav file.")
        
    file_bytes = await file.read()
    if len(file_bytes) == 0:
        raise HTTPException(status_code=400, detail="Empty stego audio uploaded.")
        
    start_time = time.time()
    try:
        message = lsb.decode_audio_lsb(file_bytes)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Audio LSB decoding failed: {str(e)}")
        
    execution_time_ms = int((time.time() - start_time) * 1000)
    
    return {
        "status": "success",
        "message": message,
        "execution_time_ms": execution_time_ms
    }

@router.post("/stego/video/encode")
async def stego_video_encode_endpoint(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    message: str = Form(...),
    frame_index: int = Form(0)
):
    background_tasks.add_task(file_handler.clean_old_temp_files)
    validate_file_size(file)
    
    if not file.filename.endswith(".avi"):
        raise HTTPException(status_code=400, detail="Only AVI format is supported for video steganography.")
        
    # Save the input video to temp path
    input_path, _ = file_handler.save_temp_file(file)
    
    # Define output path
    unique_out_name = f"stego_{os.path.basename(input_path)}"
    output_path = os.path.join(file_handler.TEMP_DIR, unique_out_name)
    relative_url = f"/temp/{unique_out_name}"
    
    start_time = time.time()
    try:
        lsb.encode_video_lsb(input_path, output_path, message, frame_index)
    except ValueError as e:
        if os.path.exists(input_path):
            os.remove(input_path)
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        if os.path.exists(input_path):
            os.remove(input_path)
        raise HTTPException(status_code=500, detail=f"Video LSB encoding failed: {str(e)}")
        
    execution_time_ms = int((time.time() - start_time) * 1000)
    
    # Clean up input file (output file is served)
    if os.path.exists(input_path):
        os.remove(input_path)
        
    return {
        "status": "success",
        "execution_time_ms": execution_time_ms,
        "download_url": relative_url
    }

@router.post("/stego/video/decode")
async def stego_video_decode_endpoint(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    frame_index: int = Form(0)
):
    background_tasks.add_task(file_handler.clean_old_temp_files)
    validate_file_size(file)
    
    if not file.filename.endswith(".avi"):
        raise HTTPException(status_code=400, detail="Please upload a valid .avi file.")
        
    input_path, _ = file_handler.save_temp_file(file)
    
    start_time = time.time()
    try:
        message = lsb.decode_video_lsb(input_path, frame_index)
    except ValueError as e:
        if os.path.exists(input_path):
            os.remove(input_path)
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        if os.path.exists(input_path):
            os.remove(input_path)
        raise HTTPException(status_code=500, detail=f"Video LSB decoding failed: {str(e)}")
        
    execution_time_ms = int((time.time() - start_time) * 1000)
    
    if os.path.exists(input_path):
        os.remove(input_path)
        
    return {
        "status": "success",
        "message": message,
        "execution_time_ms": execution_time_ms
    }
