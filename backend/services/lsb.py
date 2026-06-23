import numpy as np
import cv2
from scipy.io import wavfile
from PIL import Image
import io
import os
from typing import Tuple

def text_to_bits(text: str) -> str:
    """Converts a string of text to a string of bits, adding a delimiter."""
    text_with_delim = text + "###END###"
    bits = ""
    for byte in text_with_delim.encode('utf-8'):
        bits += f"{byte:08b}"
    return bits

def bits_to_text(bits: str) -> str:
    """Converts a bitstring back to text, stopping at the delimiter if found."""
    bytes_list = bytearray()
    for i in range(0, len(bits) - 7, 8):
        byte_str = bits[i:i+8]
        bytes_list.append(int(byte_str, 2))
        
    try:
        decoded_str = bytes_list.decode('utf-8', errors='ignore')
        if "###END###" in decoded_str:
            return decoded_str.split("###END###")[0]
    except Exception:
        pass
    return None

def encode_image_lsb(image_bytes: bytes, message: str) -> bytes:
    """
    Hides a message in an image using LSB steganography.
    """
    img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    img_array = np.array(img, dtype=np.uint8)
    
    bits = text_to_bits(message)
    num_bits = len(bits)
    
    # Calculate capacity
    h, w, c = img_array.shape
    capacity = h * w * c
    
    if num_bits > capacity:
        raise ValueError(f"Message is too long for this image. Required: {num_bits} bits, Capacity: {capacity} bits.")
        
    # Flatten the image array
    flat_arr = img_array.flatten()
    
    # Embed the bits
    for i in range(num_bits):
        bit = int(bits[i])
        # Clear LSB and set it to the bit
        flat_arr[i] = (int(flat_arr[i]) & 254) | bit
        
    # Reshape back to original image dimensions
    encoded_arr = flat_arr.reshape((h, w, c))
    
    # Save as PNG (lossless)
    encoded_img = Image.fromarray(encoded_arr)
    output_buffer = io.BytesIO()
    encoded_img.save(output_buffer, format="PNG")
    
    return output_buffer.getvalue()

def decode_image_lsb(image_bytes: bytes) -> str:
    """
    Extracts a hidden message from an image.
    """
    img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    img_array = np.array(img, dtype=np.uint8)
    
    flat_arr = img_array.flatten()
    bits = []
    
    # Read bits and check for delimiter
    for i in range(len(flat_arr)):
        bits.append(str(flat_arr[i] & 1))
        
        # Check every 8 bits (byte boundary) to see if we reached ###END###
        if len(bits) % 8 == 0:
            current_bits = "".join(bits)
            decoded = bits_to_text(current_bits)
            if decoded is not None:
                return decoded
                
    # If the loop finished without finding delimiter
    # Let's try decoding everything just in case
    decoded = bits_to_text("".join(bits))
    if decoded is not None:
        return decoded
        
    raise ValueError("No hidden message or corrupted message found (delimiter not detected).")

def encode_audio_lsb(audio_bytes: bytes, message: str) -> bytes:
    """
    Hides a message in a WAV audio file.
    """
    # Read WAV file from bytes
    sample_rate, data = wavfile.read(io.BytesIO(audio_bytes))
    
    # Ensure data is writable and we can work with it
    data = data.copy()
    
    bits = text_to_bits(message)
    num_bits = len(bits)
    
    # For stereo, data is 2D. We flatten it to 1D for easy LSB modification.
    orig_shape = data.shape
    flat_data = data.flatten()
    
    capacity = len(flat_data)
    if num_bits > capacity:
        raise ValueError(f"Message is too long for this audio. Required: {num_bits} bits, Capacity: {capacity} bits.")
        
    # Embed the bits into the LSB of audio samples
    for i in range(num_bits):
        bit = int(bits[i])
        flat_data[i] = (int(flat_data[i]) & ~1) | bit
        
    # Reshape back to original WAV dimensions
    encoded_data = flat_data.reshape(orig_shape)
    
    # Write to WAV bytes
    output_buffer = io.BytesIO()
    wavfile.write(output_buffer, sample_rate, encoded_data)
    
    return output_buffer.getvalue()

def decode_audio_lsb(audio_bytes: bytes) -> str:
    """
    Extracts a hidden message from a WAV audio file.
    """
    sample_rate, data = wavfile.read(io.BytesIO(audio_bytes))
    flat_data = data.flatten()
    
    bits = []
    for i in range(len(flat_data)):
        bits.append(str(flat_data[i] & 1))
        
        if len(bits) % 8 == 0:
            current_bits = "".join(bits)
            decoded = bits_to_text(current_bits)
            if decoded is not None:
                return decoded
                
    decoded = bits_to_text("".join(bits))
    if decoded is not None:
        return decoded
        
    raise ValueError("No hidden message or corrupted message found (delimiter not detected).")

def encode_video_lsb(video_path: str, output_path: str, message: str, frame_index: int) -> None:
    """
    Hides a message in a specific frame of a video.
    Uses uncompressed/lossless AVI format.
    """
    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        raise ValueError("Could not open video file.")
        
    # Get video properties
    fps = cap.get(cv2.CAP_PROP_FPS)
    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    
    if frame_index < 0 or frame_index >= total_frames:
        raise ValueError(f"Invalid frame index {frame_index}. Video only has {total_frames} frames.")
        
    # Read all frames into memory (since videos for demo are very short, < 50MB/few seconds)
    frames = []
    while True:
        ret, frame = cap.read()
        if not ret:
            break
        frames.append(frame)
    cap.release()
    
    # Embed message in the target frame
    target_frame = frames[frame_index].copy()
    h, w, c = target_frame.shape
    
    bits = text_to_bits(message)
    num_bits = len(bits)
    capacity = h * w * c
    
    if num_bits > capacity:
        raise ValueError(f"Message is too long for video frame. Required: {num_bits} bits, Capacity: {capacity} bits.")
        
    flat_frame = target_frame.flatten()
    for i in range(num_bits):
        bit = int(bits[i])
        flat_frame[i] = (int(flat_frame[i]) & 254) | bit
        
    frames[frame_index] = flat_frame.reshape((h, w, c))
    
    # Write frames back to file using uncompressed AVI
    # Codec 'RGBA' is uncompressed/lossless raw AVI
    fourcc = cv2.VideoWriter_fourcc(*'RGBA')
    out = cv2.VideoWriter(output_path, fourcc, fps, (width, height))
    
    for frame in frames:
        out.write(frame)
    out.release()

def decode_video_lsb(video_path: str, frame_index: int) -> str:
    """
    Extracts a hidden message from a specific frame of a video.
    """
    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        raise ValueError("Could not open video file.")
        
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    if frame_index < 0 or frame_index >= total_frames:
        raise ValueError(f"Invalid frame index {frame_index}. Video only has {total_frames} frames.")
        
    cap.set(cv2.CAP_PROP_POS_FRAMES, frame_index)
    ret, frame = cap.read()
    cap.release()
    
    if not ret:
        raise ValueError(f"Could not read frame at index {frame_index}.")
        
    flat_frame = frame.flatten()
    bits = []
    
    for i in range(len(flat_frame)):
        bits.append(str(flat_frame[i] & 1))
        
        if len(bits) % 8 == 0:
            current_bits = "".join(bits)
            decoded = bits_to_text(current_bits)
            if decoded is not None:
                return decoded
                
    decoded = bits_to_text("".join(bits))
    if decoded is not None:
        return decoded
        
    raise ValueError("No hidden message found in this frame (delimiter not detected).")
