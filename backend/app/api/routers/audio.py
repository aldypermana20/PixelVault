import os
import uuid
from fastapi import APIRouter, UploadFile, File
from fastapi.responses import FileResponse
from app.utils.file_utils import save_upload_file, get_temp_path
from app.services.codec.huffman import compress_file_huffman, decompress_file_huffman
from app.db import update_stats

router = APIRouter()

@router.post("/compress")
async def compress_audio(file: UploadFile = File(...)):
    input_path = save_upload_file(file)
    output_filename = f"compressed_audio_{uuid.uuid4()}.huf"
    output_path = get_temp_path(output_filename)
    
    compress_file_huffman(input_path, output_path)
    
    original_size = os.path.getsize(input_path)
    compressed_size = os.path.getsize(output_path)
    update_stats("audio", "compress", original_size, compressed_size)
    
    return {
        "original_size": original_size,
        "compressed_size": compressed_size,
        "compression_ratio": round((compressed_size / original_size) * 100, 2),
        "download_url": f"/api/audio/download/{output_filename}"
    }

@router.post("/decompress")
async def decompress_audio(file: UploadFile = File(...)):
    input_path = save_upload_file(file)
    output_filename = f"decompressed_audio_{uuid.uuid4()}.wav"
    output_path = get_temp_path(output_filename)
    
    decompress_file_huffman(input_path, output_path)
    update_stats("audio", "decompress")
    
    return {
        "download_url": f"/api/audio/download/{output_filename}"
    }

@router.get("/download/{filename}")
async def download_file(filename: str):
    return FileResponse(get_temp_path(filename), filename=filename)
