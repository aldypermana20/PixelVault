from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.db import init_db, get_stats
from app.api.routers import image, audio, video, stego

app = FastAPI(title="MultiMedia Codec & Steganography Studio")

app.include_router(image.router, prefix="/api/image", tags=["Image Codec"])
app.include_router(audio.router, prefix="/api/audio", tags=["Audio Codec"])
app.include_router(video.router, prefix="/api/video", tags=["Video Codec"])
app.include_router(stego.router, prefix="/api/stego", tags=["Steganography"])

# CORS setup agar Frontend React dapat mengakses API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def startup_event():
    init_db()

@app.get("/")
def read_root():
    return {"message": "Welcome to MultiMedia Codec & Steganography API"}

@app.get("/api/dashboard")
def get_dashboard_stats():
    return get_stats()
