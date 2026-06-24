import os
import uuid
from fastapi import APIRouter, UploadFile, File, Form
from fastapi.responses import FileResponse
from app.utils.file_utils import save_upload_file, get_temp_path
from app.services.steganography.lsb_image import embed_lsb_image, extract_lsb_image
from app.services.steganography.lsb_audio import embed_lsb_audio, extract_lsb_audio
from app.services.steganography.lsb_video import embed_lsb_video, extract_lsb_video
from app.db import update_stats

router = APIRouter()

# --- IMAGE STEGO ---
@router.post("/image/embed")
async def stego_embed_image(file: UploadFile = File(...), secret_message: str = Form(...)):
    input_path = save_upload_file(file)
    output_filename = f"stego_image_{uuid.uuid4()}.png"
    output_path = get_temp_path(output_filename)
    
    embed_lsb_image(input_path, secret_message, output_path)
    update_stats("stego_image", "embed")
    
    return {"download_url": f"/api/stego/download/{output_filename}"}

@router.post("/image/extract")
async def stego_extract_image(file: UploadFile = File(...)):
    input_path = save_upload_file(file)
    secret = extract_lsb_image(input_path)
    update_stats("stego_image", "extract")
    return {"secret_message": secret}

# --- AUDIO STEGO ---
@router.post("/audio/embed")
async def stego_embed_audio(file: UploadFile = File(...), secret_message: str = Form(...)):
    input_path = save_upload_file(file)
    output_filename = f"stego_audio_{uuid.uuid4()}.wav"
    output_path = get_temp_path(output_filename)
    
    embed_lsb_audio(input_path, secret_message, output_path)
    update_stats("stego_audio", "embed")
    
    return {"download_url": f"/api/stego/download/{output_filename}"}

@router.post("/audio/extract")
async def stego_extract_audio(file: UploadFile = File(...)):
    input_path = save_upload_file(file)
    secret = extract_lsb_audio(input_path)
    update_stats("stego_audio", "extract")
    return {"secret_message": secret}

# --- VIDEO STEGO ---
@router.post("/video/embed")
async def stego_embed_video(file: UploadFile = File(...), secret_message: str = Form(...)):
    input_path = save_upload_file(file)
    output_filename = f"stego_video_{uuid.uuid4()}.avi"
    output_path = get_temp_path(output_filename)
    
    embed_lsb_video(input_path, secret_message, output_path)
    update_stats("stego_video", "embed")
    
    return {"download_url": f"/api/stego/download/{output_filename}"}

@router.post("/video/extract")
async def stego_extract_video(file: UploadFile = File(...)):
    input_path = save_upload_file(file)
    secret = extract_lsb_video(input_path)
    update_stats("stego_video", "extract")
    return {"secret_message": secret}

@router.get("/download/{filename}")
async def download_file(filename: str):
    return FileResponse(get_temp_path(filename), filename=filename)
