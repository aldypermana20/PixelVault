import os
import shutil
import uuid

TEMP_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "temp")

def init_temp_dir():
    if not os.path.exists(TEMP_DIR):
        os.makedirs(TEMP_DIR)

def save_upload_file(upload_file):
    init_temp_dir()
    file_extension = os.path.splitext(upload_file.filename)[1]
    unique_filename = f"{uuid.uuid4()}{file_extension}"
    file_path = os.path.join(TEMP_DIR, unique_filename)
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(upload_file.file, buffer)
        
    return file_path

def get_temp_path(filename):
    init_temp_dir()
    return os.path.join(TEMP_DIR, filename)

def clear_temp_dir():
    if os.path.exists(TEMP_DIR):
        for f in os.listdir(TEMP_DIR):
            os.remove(os.path.join(TEMP_DIR, f))
