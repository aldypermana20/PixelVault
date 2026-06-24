import json
import os

DB_FILE = os.path.join(os.path.dirname(__file__), "db.json")

def init_db():
    if not os.path.exists(DB_FILE):
        default_data = {
            "total_files_processed": 0,
            "total_compression_saved_bytes": 0,
            "processed_history": []
        }
        with open(DB_FILE, "w") as f:
            json.dump(default_data, f, indent=4)

def get_stats():
    if not os.path.exists(DB_FILE):
        init_db()
    with open(DB_FILE, "r") as f:
        return json.load(f)

def update_stats(file_type, process_type, original_size=0, processed_size=0):
    stats = get_stats()
    
    stats["total_files_processed"] += 1
    
    if process_type == "compress":
        saved = original_size - processed_size
        if saved > 0:
            stats["total_compression_saved_bytes"] += saved
            
    stats["processed_history"].append({
        "file_type": file_type,
        "process_type": process_type,
        "original_size": original_size,
        "processed_size": processed_size
    })
    
    with open(DB_FILE, "w") as f:
        json.dump(stats, f, indent=4)
