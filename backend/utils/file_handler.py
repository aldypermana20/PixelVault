import os
import uuid
import time
from fastapi import UploadFile
import shutil
from typing import Tuple

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TEMP_DIR = os.path.join(BASE_DIR, "temp")

os.makedirs(TEMP_DIR, exist_ok=True)

def save_temp_file(upload_file: UploadFile, extension: str = None) -> Tuple[str, str]:
    """
    Saves an uploaded file to the temporary directory.
    Returns (absolute_path, relative_url).
    """
    if not extension:
        _, ext = os.path.splitext(upload_file.filename)
        extension = ext.lower()
    else:
        if not extension.startswith('.'):
            extension = '.' + extension
            
    unique_filename = f"{uuid.uuid4()}{extension}"
    file_path = os.path.join(TEMP_DIR, unique_filename)
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(upload_file.file, buffer)
        
    relative_url = f"/temp/{unique_filename}"
    return file_path, relative_url

def save_bytes_to_temp(data: bytes, extension: str) -> Tuple[str, str]:
    """
    Saves a raw byte array to a temporary file.
    Returns (absolute_path, relative_url).
    """
    if not extension.startswith('.'):
        extension = '.' + extension
        
    unique_filename = f"{uuid.uuid4()}{extension}"
    file_path = os.path.join(TEMP_DIR, unique_filename)
    
    with open(file_path, "wb") as buffer:
        buffer.write(data)
        
    relative_url = f"/temp/{unique_filename}"
    return file_path, relative_url

def clean_old_temp_files(max_age_seconds: int = 600):
    """
    Cleans up files in the temp directory that are older than max_age_seconds (default 10 minutes).
    Can be run as a background task.
    """
    now = time.time()
    for filename in os.listdir(TEMP_DIR):
        file_path = os.path.join(TEMP_DIR, filename)
        # Avoid deleting folder or hidden files
        if os.path.isfile(file_path) and not filename.startswith('.'):
            file_creation_time = os.path.getmtime(file_path)
            if (now - file_creation_time) > max_age_seconds:
                try:
                    os.remove(file_path)
                except Exception:
                    pass
