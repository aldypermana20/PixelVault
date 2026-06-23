import unittest
import numpy as np
import os
import tempfile
import cv2
from scipy.io import wavfile
from PIL import Image
import io

from backend.services import huffman, dct, lsb, video_codec, audio_codec
from backend.utils import metrics

class TestAlgorithms(unittest.TestCase):
    
    def test_huffman_compression(self):
        """Test that Huffman compression and decompression returns the exact original bytes."""
        original_data = b"Hello world! This is PixelVault Huffman Coding test data. " * 50
        
        # Compress
        compressed = huffman.compress_bytes(original_data)
        self.assertIsNotNone(compressed)
        self.assertTrue(len(compressed) > 0)
        
        # Decompress
        decompressed = huffman.decompress_bytes(compressed)
        self.assertEqual(original_data, decompressed)

    def test_huffman_image_roundtrip(self):
        """Test Huffman image roundtrip: PNG -> raw pixels -> compress -> decompress -> identical PNG."""
        import struct
        
        # Create a dummy gradient image
        w, h = 64, 64
        img_arr = np.zeros((h, w, 3), dtype=np.uint8)
        for y in range(h):
            for x in range(w):
                img_arr[y, x, 0] = (x * 4) % 256
                img_arr[y, x, 1] = (y * 4) % 256
                img_arr[y, x, 2] = (x + y) % 256
        
        img = Image.fromarray(img_arr)
        raw_pixels = img.tobytes()
        raw_size = len(raw_pixels)
        
        # Prepend PVHI header
        header = struct.pack(">4sHH", b"PVHI", w, h)
        payload = header + raw_pixels
        
        # Compress
        compressed = huffman.compress_bytes(payload)
        self.assertTrue(len(compressed) < raw_size, 
                        f"Huffman should compress raw pixels: {len(compressed)} >= {raw_size}")
        
        # Decompress
        decompressed = huffman.decompress_bytes(compressed)
        
        # Verify header
        self.assertEqual(decompressed[:4], b"PVHI")
        _, dec_w, dec_h = struct.unpack(">4sHH", decompressed[:8])
        self.assertEqual(dec_w, w)
        self.assertEqual(dec_h, h)
        
        # Verify pixels are identical
        dec_pixels = decompressed[8:]
        self.assertEqual(raw_pixels, dec_pixels)
        
        # Reconstruct image and verify pixel values
        recon_img = Image.frombytes("RGB", (dec_w, dec_h), dec_pixels)
        recon_arr = np.array(recon_img, dtype=np.uint8)
        np.testing.assert_array_equal(img_arr, recon_arr)
        
    def test_dct_compression(self):
        """Test DCT compression, decompression, and PSNR calculations."""
        # Create a dummy gradient image
        w, h = 128, 128
        img_arr = np.zeros((h, w, 3), dtype=np.uint8)
        for y in range(h):
            for x in range(w):
                img_arr[y, x, 0] = (x * 2) % 256  # Red gradient
                img_arr[y, x, 1] = (y * 2) % 256  # Green gradient
                img_arr[y, x, 2] = (x + y) % 256  # Blue gradient
                
        img = Image.fromarray(img_arr)
        img_buffer = io.BytesIO()
        img.save(img_buffer, format="PNG")
        original_bytes = img_buffer.getvalue()
        
        # Compress with quality 80
        compressed = dct.compress_image_dct(original_bytes, quality=80)
        self.assertIsNotNone(compressed)
        self.assertTrue(len(compressed) < (w * h * 3))  # Should be compressed compared to raw RGB pixels
        
        # Decompress
        recon_bytes, quality = dct.decompress_image_dct(compressed)
        self.assertEqual(quality, 80)
        
        # Calculate PSNR (should be high quality, e.g., > 30 dB)
        psnr = metrics.calculate_psnr(original_bytes, recon_bytes)
        self.assertTrue(psnr > 30.0, f"PSNR was too low: {psnr} dB")
        
    def test_lsb_image_stego(self):
        """Test LSB steganography in images."""
        # Create a dummy image
        img_arr = np.random.randint(0, 255, (100, 100, 3), dtype=np.uint8)
        img = Image.fromarray(img_arr)
        img_buffer = io.BytesIO()
        img.save(img_buffer, format="PNG")
        cover_bytes = img_buffer.getvalue()
        
        secret_message = "PixelVault steganography is awesome!"
        
        # Encode
        stego_bytes = lsb.encode_image_lsb(cover_bytes, secret_message)
        self.assertIsNotNone(stego_bytes)
        
        # Decode
        extracted_message = lsb.decode_image_lsb(stego_bytes)
        self.assertEqual(secret_message, extracted_message)
        
    def test_lsb_audio_stego(self):
        """Test LSB steganography in WAV audio files."""
        # Create a dummy 1-second audio sine wave (mono, 44.1kHz, int16)
        sample_rate = 11025
        t = np.linspace(0, 1, sample_rate, endpoint=False)
        data = np.sin(2 * np.pi * 440 * t) * 10000
        data = data.astype(np.int16)
        
        audio_buffer = io.BytesIO()
        wavfile.write(audio_buffer, sample_rate, data)
        cover_audio = audio_buffer.getvalue()
        
        secret_message = "Stego message in WAV sample."
        
        # Encode
        stego_audio = lsb.encode_audio_lsb(cover_audio, secret_message)
        self.assertIsNotNone(stego_audio)
        
        # Decode
        extracted_message = lsb.decode_audio_lsb(stego_audio)
        self.assertEqual(secret_message, extracted_message)
        
    def test_lsb_video_stego(self):
        """Test LSB steganography in AVI video files."""
        # Create a dummy AVI video with 5 frames of 64x64 pixels
        fps = 10.0
        width, height = 64, 64
        
        # Use temp files for video path processing
        with tempfile.NamedTemporaryFile(suffix=".avi", delete=False) as temp_in, \
             tempfile.NamedTemporaryFile(suffix=".avi", delete=False) as temp_out:
            
            temp_in_path = temp_in.name
            temp_out_path = temp_out.name
            
        try:
            # Write dummy video
            fourcc = cv2.VideoWriter_fourcc(*'IYUV')
            out = cv2.VideoWriter(temp_in_path, fourcc, fps, (width, height))
            
            for i in range(5):
                # Generate random color frame
                frame = np.random.randint(0, 255, (height, width, 3), dtype=np.uint8)
                out.write(frame)
            out.release()
            
            secret_message = "Hidden message in frame 2!"
            frame_idx = 2
            
            # Encode LSB
            lsb.encode_video_lsb(temp_in_path, temp_out_path, secret_message, frame_idx)
            
            # Verify output file exists and is not empty
            self.assertTrue(os.path.exists(temp_out_path))
            self.assertTrue(os.path.getsize(temp_out_path) > 0)
            
            # Decode LSB
            extracted_message = lsb.decode_video_lsb(temp_out_path, frame_idx)
            self.assertEqual(secret_message, extracted_message)
            
        finally:
            # Clean up files
            if os.path.exists(temp_in_path):
                os.remove(temp_in_path)
            if os.path.exists(temp_out_path):
                os.remove(temp_out_path)

    def test_audio_downsampling(self):
        """Test audio lossy compression via downsampling."""
        # Create a dummy WAV sample
        sample_rate = 11025
        t = np.linspace(0, 1, sample_rate, endpoint=False)
        data = np.sin(2 * np.pi * 440 * t) * 10000
        data = data.astype(np.int16)
        
        audio_buffer = io.BytesIO()
        wavfile.write(audio_buffer, sample_rate, data)
        cover_audio = audio_buffer.getvalue()
        
        # Downsample with factor 2
        downsampled = audio_codec.downsample_audio(cover_audio, factor=2)
        self.assertIsNotNone(downsampled)
        self.assertTrue(len(downsampled) < len(cover_audio))
        
        # Verify the new sample rate is half
        downsampled_sr, downsampled_data = wavfile.read(io.BytesIO(downsampled))
        self.assertEqual(downsampled_sr, sample_rate // 2)
        self.assertEqual(len(downsampled_data), (len(data) + 1) // 2)
        
    def test_video_structural_compression(self):
        """Test video lossy structural compression (FPS and spatial scaling)."""
        fps = 10.0
        width, height = 64, 64
        
        with tempfile.NamedTemporaryFile(suffix=".avi", delete=False) as temp_in, \
             tempfile.NamedTemporaryFile(suffix=".avi", delete=False) as temp_out:
            
            temp_in_path = temp_in.name
            temp_out_path = temp_out.name
            
        try:
            # Write dummy video (10 frames)
            fourcc = cv2.VideoWriter_fourcc(*'IYUV')
            out = cv2.VideoWriter(temp_in_path, fourcc, fps, (width, height))
            for i in range(10):
                frame = np.random.randint(0, 255, (height, width, 3), dtype=np.uint8)
                out.write(frame)
            out.release()
            
            # Compress: scale = 0.5, target_fps = 5
            orig_size, comp_size = video_codec.compress_video_structural(
                temp_in_path, temp_out_path, scale=0.5, target_fps=5
            )
            
            # Verify sizes and existence
            self.assertTrue(os.path.exists(temp_out_path))
            self.assertTrue(comp_size > 0)
            
            # Read compressed video properties
            cap = cv2.VideoCapture(temp_out_path)
            comp_width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
            comp_height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
            comp_fps = cap.get(cv2.CAP_PROP_FPS)
            
            # Count frames in compressed video
            comp_frames_count = 0
            while True:
                ret, _ = cap.read()
                if not ret:
                    break
                comp_frames_count += 1
            cap.release()
            
            # Scale 0.5 of 64 should be 32
            self.assertEqual(comp_width, 32)
            self.assertEqual(comp_height, 32)
            self.assertEqual(comp_fps, 5.0)
            self.assertEqual(comp_frames_count, 5) # 10 frames @ 10fps compressed to 5fps should be 5 frames
            
            # Verify PSNR calculation runs without errors
            psnr = video_codec.calculate_video_psnr(temp_in_path, temp_out_path)
            self.assertTrue(psnr >= 0.0)
            
        finally:
            if os.path.exists(temp_in_path):
                os.remove(temp_in_path)
            if os.path.exists(temp_out_path):
                os.remove(temp_out_path)

if __name__ == "__main__":
    unittest.main()
