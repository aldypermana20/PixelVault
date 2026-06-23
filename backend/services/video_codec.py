import cv2
import os
import numpy as np
from typing import Tuple

def compress_video_structural(input_path: str, output_path: str, scale: float, target_fps: int) -> Tuple[int, int]:
    """
    Compresses a video structurally by scaling resolution (spatial) and dropping frames (temporal).
    Saves in AVI format using MJPG codec.
    """
    cap = cv2.VideoCapture(input_path)
    if not cap.isOpened():
        raise ValueError("Could not open video file.")
        
    orig_fps = cap.get(cv2.CAP_PROP_FPS)
    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    
    # Validation
    if orig_fps <= 0:
        orig_fps = 30.0
    if target_fps <= 0:
        target_fps = 15
    if target_fps > orig_fps:
        target_fps = int(orig_fps)
        
    new_width = int(width * scale)
    new_height = int(height * scale)
    
    # Ensure dimensions are even and positive
    new_width = max(2, (new_width // 2) * 2)
    new_height = max(2, (new_height // 2) * 2)
    
    # Codec 'MJPG' is highly compatible with AVI and opencv write
    fourcc = cv2.VideoWriter_fourcc(*'MJPG')
    out = cv2.VideoWriter(output_path, fourcc, target_fps, (new_width, new_height))
    
    ratio = orig_fps / target_fps
    keep_indices = set()
    duration_seconds = total_frames / orig_fps if orig_fps > 0 else 0
    num_output_frames = int(duration_seconds * target_fps)
    if num_output_frames <= 0:
        num_output_frames = 1
        
    for j in range(num_output_frames):
        idx = int(round(j * ratio))
        if idx < total_frames:
            keep_indices.add(idx)
            
    if not keep_indices:
        keep_indices.add(0)
        
    frame_idx = 0
    while True:
        ret, frame = cap.read()
        if not ret:
            break
            
        if frame_idx in keep_indices:
            # Spatial scaling
            resized_frame = cv2.resize(frame, (new_width, new_height), interpolation=cv2.INTER_AREA)
            out.write(resized_frame)
            
        frame_idx += 1
        
    cap.release()
    out.release()
    
    orig_size = os.path.getsize(input_path)
    comp_size = os.path.getsize(output_path)
    
    return orig_size, comp_size

def calculate_video_psnr(orig_path: str, recon_path: str) -> float:
    """
    Calculates the average Peak Signal-to-Noise Ratio (PSNR) between the original and compressed video.
    Aligns frames based on frame rate and resizes reconstructed frames to original size for comparison.
    """
    cap_orig = cv2.VideoCapture(orig_path)
    cap_recon = cv2.VideoCapture(recon_path)
    
    if not cap_orig.isOpened() or not cap_recon.isOpened():
        if cap_orig.isOpened(): cap_orig.release()
        if cap_recon.isOpened(): cap_recon.release()
        return 0.0
        
    fps_orig = cap_orig.get(cv2.CAP_PROP_FPS)
    fps_recon = cap_recon.get(cv2.CAP_PROP_FPS)
    
    # Read original frames
    frames_orig = []
    while True:
        ret, frame = cap_orig.read()
        if not ret:
            break
        frames_orig.append(frame)
    cap_orig.release()
    
    # Read reconstructed frames
    frames_recon = []
    while True:
        ret, frame = cap_recon.read()
        if not ret:
            break
        frames_recon.append(frame)
    cap_recon.release()
    
    if not frames_orig or not frames_recon:
        return 0.0
        
    fps_orig = fps_orig if fps_orig > 0 else 30.0
    fps_recon = fps_recon if fps_recon > 0 else 15.0
    ratio = fps_orig / fps_recon
    
    psnr_values = []
    
    for j, frame_recon in enumerate(frames_recon):
        # Map to original frame index
        orig_idx = int(round(j * ratio))
        orig_idx = min(orig_idx, len(frames_orig) - 1)
        
        frame_orig = frames_orig[orig_idx]
        
        # Resize to original dimensions
        h_orig, w_orig, _ = frame_orig.shape
        resized_recon = cv2.resize(frame_recon, (w_orig, h_orig), interpolation=cv2.INTER_CUBIC)
        
        # Compute MSE
        mse = np.mean((frame_orig.astype(np.float64) - resized_recon.astype(np.float64)) ** 2)
        if mse == 0:
            psnr_values.append(99.0)
        else:
            psnr = 20 * np.log10(255.0 / np.sqrt(mse))
            psnr_values.append(psnr)
            
    if not psnr_values:
        return 0.0
        
    return round(float(np.mean(psnr_values)), 2)
