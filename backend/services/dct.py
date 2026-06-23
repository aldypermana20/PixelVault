import numpy as np
import struct
from scipy.fftpack import dct, idct
from PIL import Image
import io
from typing import Tuple

# Standard JPEG Quantization Matrices
Q_LUMINANCE = np.array([
    [16, 11, 10, 16, 24, 40, 51, 61],
    [12, 12, 14, 19, 26, 58, 60, 55],
    [14, 13, 16, 24, 40, 57, 69, 56],
    [14, 17, 22, 29, 51, 87, 80, 62],
    [18, 22, 37, 56, 68, 109, 103, 77],
    [24, 35, 55, 64, 81, 104, 113, 92],
    [49, 64, 78, 87, 103, 121, 120, 101],
    [72, 92, 95, 98, 112, 100, 103, 99]
], dtype=np.float32)

Q_CHROMINANCE = np.array([
    [17, 18, 24, 47, 99, 99, 99, 99],
    [18, 21, 26, 66, 99, 99, 99, 99],
    [24, 26, 56, 99, 99, 99, 99, 99],
    [47, 66, 99, 99, 99, 99, 99, 99],
    [99, 99, 99, 99, 99, 99, 99, 99],
    [99, 99, 99, 99, 99, 99, 99, 99],
    [99, 99, 99, 99, 99, 99, 99, 99],
    [99, 99, 99, 99, 99, 99, 99, 99]
], dtype=np.float32)

# Zigzag scan order coordinates
ZIGZAG_INDEX = [
    (0,0),
    (0,1), (1,0),
    (2,0), (1,1), (0,2),
    (0,3), (1,2), (2,1), (3,0),
    (4,0), (3,1), (2,2), (1,3), (0,4),
    (0,5), (1,4), (2,3), (3,2), (4,1), (5,0),
    (6,0), (5,1), (4,2), (3,3), (2,4), (1,5), (0,6),
    (0,7), (1,6), (2,5), (3,4), (4,3), (5,2), (6,1), (7,0),
    (7,1), (6,2), (5,3), (4,4), (3,5), (2,6), (1,7),
    (2,7), (3,6), (4,5), (5,4), (6,3), (7,2),
    (7,3), (6,4), (5,5), (4,6), (3,7),
    (4,7), (5,6), (6,5), (7,4),
    (7,5), (6,6), (5,7),
    (6,7), (7,6),
    (7,7)
]

def rgb_to_ycbcr(img_array: np.ndarray) -> Tuple[np.ndarray, np.ndarray, np.ndarray]:
    """Convert RGB image array to Y, Cb, Cr channels."""
    r, g, b = img_array[:,:,0], img_array[:,:,1], img_array[:,:,2]
    y = 0.299 * r + 0.587 * g + 0.114 * b
    cb = -0.1687 * r - 0.3313 * g + 0.5 * b + 128
    cr = 0.5 * r - 0.4187 * g - 0.0813 * b + 128
    return y, cb, cr

def ycbcr_to_rgb(y: np.ndarray, cb: np.ndarray, cr: np.ndarray) -> np.ndarray:
    """Convert Y, Cb, Cr channels back to RGB image array."""
    r = y + 1.402 * (cr - 128)
    g = y - 0.34414 * (cb - 128) - 0.71414 * (cr - 128)
    b = y + 1.772 * (cb - 128)
    
    rgb = np.stack([r, g, b], axis=-1)
    return np.clip(np.round(rgb), 0, 255).astype(np.uint8)

def dct2d(block: np.ndarray) -> np.ndarray:
    """Perform 2D Discrete Cosine Transform."""
    return dct(dct(block.T, norm='ortho').T, norm='ortho')

def idct2d(block: np.ndarray) -> np.ndarray:
    """Perform 2D Inverse Discrete Cosine Transform."""
    return idct(idct(block.T, norm='ortho').T, norm='ortho')

def zigzag(block: np.ndarray) -> np.ndarray:
    """Extract block values in zigzag order."""
    return np.array([block[r, c] for r, c in ZIGZAG_INDEX], dtype=np.int16)

def inverse_zigzag(vector: np.ndarray) -> np.ndarray:
    """Reconstruct 8x8 block from zigzag vector."""
    block = np.zeros((8, 8), dtype=np.float32)
    for i, (r, c) in enumerate(ZIGZAG_INDEX):
        block[r, c] = vector[i]
    return block

def rle_encode(data: np.ndarray) -> list:
    """Run-length encode an array of integers into (value, count) pairs."""
    encoded = []
    if len(data) == 0:
        return encoded
    current_val = data[0]
    current_count = 1
    for val in data[1:]:
        if val == current_val:
            current_count += 1
        else:
            encoded.append((current_val, current_count))
            current_val = val
            current_count = 1
    encoded.append((current_val, current_count))
    return encoded

def rle_decode(encoded: list) -> np.ndarray:
    """Decode RLE list of (value, count) pairs back to an array."""
    decoded = []
    for val, count in encoded:
        decoded.extend([val] * count)
    return np.array(decoded, dtype=np.int16)

def get_quantization_matrix(quality: int, is_luminance: bool = True) -> np.ndarray:
    """Scale quantization matrix based on quality factor (1-100)."""
    if quality < 1:
        quality = 1
    elif quality > 100:
        quality = 100
        
    if quality < 50:
        scale = 50 / quality
    else:
        scale = (100 - quality) / 50
        
    Q = Q_LUMINANCE if is_luminance else Q_CHROMINANCE
    
    # Scale and clip to prevent divide-by-zero or overflow
    Q_scaled = np.clip(np.round(Q * scale), 1, 255)
    return Q_scaled.astype(np.float32)

def compress_image_dct(image_bytes: bytes, quality: int = 50) -> bytes:
    """
    Compresses an image using DCT, Quantization, Zigzag, and RLE.
    """
    # 1. Load image and ensure RGB mode
    img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    orig_w, orig_h = img.size
    
    # Pad to multiple of 8
    pad_w = (orig_w + 7) // 8 * 8
    pad_h = (orig_h + 7) // 8 * 8
    
    padded_img = Image.new("RGB", (pad_w, pad_h), (0, 0, 0))
    padded_img.paste(img, (0, 0))
    
    img_array = np.array(padded_img, dtype=np.float32)
    
    # 2. Convert to YCbCr
    y, cb, cr = rgb_to_ycbcr(img_array)
    
    # 3. Get scaled Q-matrices
    q_y = get_quantization_matrix(quality, is_luminance=True)
    q_c = get_quantization_matrix(quality, is_luminance=False)
    
    # 4. Process each channel in 8x8 blocks
    channels_data = { 'y': [], 'cb': [], 'cr': [] }
    
    for ch_name, ch_arr, q_mat in [('y', y, q_y), ('cb', cb, q_c), ('cr', cr, q_c)]:
        for r in range(0, pad_h, 8):
            for c in range(0, pad_w, 8):
                # Subtract 128 for level shift
                block = ch_arr[r:r+8, c:c+8] - 128
                # Apply 2D DCT
                dct_block = dct2d(block)
                # Quantization
                quantized = np.round(dct_block / q_mat).astype(np.int16)
                # Zigzag Scan
                vector = zigzag(quantized)
                channels_data[ch_name].extend(vector)
                
    # 5. Run-Length Encode channels
    y_rle = rle_encode(np.array(channels_data['y'], dtype=np.int16))
    cb_rle = rle_encode(np.array(channels_data['cb'], dtype=np.int16))
    cr_rle = rle_encode(np.array(channels_data['cr'], dtype=np.int16))
    
    # 6. Build Binary File
    # Format:
    # Header:
    # - Magic (4 bytes): b'PVDT'
    # - pad_w, pad_h, orig_w, orig_h (4 * 2 bytes = 8 bytes, uint16)
    # - quality (1 byte, uint8)
    # - len(y_rle), len(cb_rle), len(cr_rle) (3 * 4 bytes = 12 bytes, uint32)
    # Data:
    # - RLE bytes: each pair is struct (val: int16, count: uint16) = 4 bytes
    header = struct.pack(">4sHHHHBIII", 
                         b"PVDT", 
                         pad_w, pad_h, orig_w, orig_h, 
                         quality,
                         len(y_rle), len(cb_rle), len(cr_rle))
    
    data_bytes = bytearray(header)
    for rle in [y_rle, cb_rle, cr_rle]:
        for val, count in rle:
            data_bytes.extend(struct.pack(">hH", val, count))
            
    return bytes(data_bytes)

def decompress_image_dct(dct_bytes: bytes) -> Tuple[bytes, int]:
    """
    Decompresses DCT bytes back to a PNG image.
    Returns (PNG image bytes, quality).
    """
    if len(dct_bytes) < 25:
        raise ValueError("Invalid compressed DCT file size.")
        
    # 1. Read Header
    magic, pad_w, pad_h, orig_w, orig_h, quality, len_y, len_cb, len_cr = struct.unpack(
        ">4sHHHHBIII", dct_bytes[:25]
    )
    
    if magic != b"PVDT":
        raise ValueError("File is not a valid PixelVault DCT file.")
        
    offset = 25
    
    # Helper to unpack RLE list
    def unpack_rle(length):
        nonlocal offset
        rle_list = []
        for _ in range(length):
            if offset + 4 > len(dct_bytes):
                raise ValueError("Corrupt file: data is truncated.")
            val, count = struct.unpack(">hH", dct_bytes[offset:offset+4])
            rle_list.append((val, count))
            offset += 4
        return rle_list
        
    # 2. Extract RLE lists
    y_rle = unpack_rle(len_y)
    cb_rle = unpack_rle(len_cb)
    cr_rle = unpack_rle(len_cr)
    
    # 3. Decode RLE
    y_vectors = rle_decode(y_rle)
    cb_vectors = rle_decode(cb_rle)
    cr_vectors = rle_decode(cr_rle)
    
    # 4. Get scaled Q-matrices
    q_y = get_quantization_matrix(quality, is_luminance=True)
    q_c = get_quantization_matrix(quality, is_luminance=False)
    
    # 5. Reconstruct channels
    y_recon = np.zeros((pad_h, pad_w), dtype=np.float32)
    cb_recon = np.zeros((pad_h, pad_w), dtype=np.float32)
    cr_recon = np.zeros((pad_h, pad_w), dtype=np.float32)
    
    # Loop blocks and reconstruct
    block_idx = 0
    for r in range(0, pad_h, 8):
        for c in range(0, pad_w, 8):
            # Y channel
            vec_y = y_vectors[block_idx*64 : (block_idx+1)*64]
            block_y_q = inverse_zigzag(vec_y)
            y_recon[r:r+8, c:c+8] = idct2d(block_y_q * q_y) + 128
            
            # Cb channel
            vec_cb = cb_vectors[block_idx*64 : (block_idx+1)*64]
            block_cb_q = inverse_zigzag(vec_cb)
            cb_recon[r:r+8, c:c+8] = idct2d(block_cb_q * q_c) + 128
            
            # Cr channel
            vec_cr = cr_vectors[block_idx*64 : (block_idx+1)*64]
            block_cr_q = inverse_zigzag(vec_cr)
            cr_recon[r:r+8, c:c+8] = idct2d(block_cr_q * q_c) + 128
            
            block_idx += 1
            
    # 6. Convert back to RGB
    rgb_padded = ycbcr_to_rgb(y_recon, cb_recon, cr_recon)
    
    # Crop to original size
    rgb_final = rgb_padded[:orig_h, :orig_w, :]
    
    # Save as PNG bytes
    img_out = Image.fromarray(rgb_final)
    output_buffer = io.BytesIO()
    img_out.save(output_buffer, format="PNG")
    
    return output_buffer.getvalue(), quality
