import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from backend.routers import compress_router, stego_router

app = FastAPI(
    title="PixelVault API",
    description="Backend API for Huffman/DCT Compression and LSB Steganography",
    version="1.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify frontend URL (e.g., http://localhost:5173)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Ensure temp directory exists for file processing
TEMP_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "temp")
os.makedirs(TEMP_DIR, exist_ok=True)

# Mount temp folder to serve static files for downloads
app.mount("/temp", StaticFiles(directory=TEMP_DIR), name="temp")

# Include routers
app.include_router(compress_router.router, prefix="/api", tags=["Compression"])
app.include_router(stego_router.router, prefix="/api", tags=["Steganography"])

@app.get("/")
def read_root():
    return {"message": "Welcome to PixelVault API. Go to /docs for API documentation."}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
