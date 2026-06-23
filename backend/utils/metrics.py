import numpy as np
from PIL import Image
import io
import math

def calculate_compression_ratio(original_size: int, compressed_size: int) -> str:
    """Calculates compression ratio and returns it as a formatted percentage string."""
    if original_size <= 0:
        return "0.00%"
    ratio = (1.0 - (compressed_size / original_size)) * 100
    return f"{ratio:.2f}%"

def calculate_psnr(original_bytes: bytes, reconstructed_bytes: bytes) -> float:
    """
    Calculates Peak Signal-to-Noise Ratio (PSNR) in dB between two images.
    If images are identical, returns 99.0 (to avoid division by zero).
    """
    img_orig = Image.open(io.BytesIO(original_bytes)).convert("RGB")
    img_recon = Image.open(io.BytesIO(reconstructed_bytes)).convert("RGB")
    
    # Ensure they have the same size
    if img_orig.size != img_recon.size:
        # Resize reconstructed to original size if they differ due to padding
        img_recon = img_recon.resize(img_orig.size)
        
    arr_orig = np.array(img_orig, dtype=np.float64)
    arr_recon = np.array(img_recon, dtype=np.float64)
    
    mse = np.mean((arr_orig - arr_recon) ** 2)
    if mse == 0:
        return 99.0  # Identical images
        
    max_pixel = 255.0
    psnr = 20 * math.log10(max_pixel / math.sqrt(mse))
    return round(psnr, 2)
