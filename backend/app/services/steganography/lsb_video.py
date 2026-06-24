import cv2
import numpy as np

def msg_to_bin(msg):
    if type(msg) == str:
        return ''.join([format(ord(i), "08b") for i in msg])
    elif type(msg) == bytes or type(msg) == np.ndarray:
        return [format(i, "08b") for i in msg]
    elif type(msg) == int or type(msg) == np.uint8:
        return format(msg, "08b")
    else:
        raise TypeError("Input type not supported")

def embed_lsb_video(video_path, secret_data, output_path):
    """
    Menyisipkan teks rahasia ke dalam frame video menggunakan metode LSB.
    Menggunakan Codec Lossless agar bit LSB tidak rusak karena kompresi frame.
    """
    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        raise ValueError("Video tidak ditemukan.")
        
    fps = cap.get(cv2.CAP_PROP_FPS)
    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    
    # Menggunakan HFYU (Huffman Lossless Codec) atau FFV1 untuk video output
    fourcc = cv2.VideoWriter_fourcc(*'HFYU')
    out = cv2.VideoWriter(output_path, fourcc, fps, (width, height))
    
    secret_data += "====EOF===="
    binary_secret_data = msg_to_bin(secret_data)
    data_len = len(binary_secret_data)
    data_index = 0
    
    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break
            
        if data_index < data_len:
            for row in frame:
                if data_index >= data_len:
                    break
                for pixel in row:
                    if data_index >= data_len:
                        break
                    for channel in range(3):
                        if data_index < data_len:
                            pixel[channel] = int(bin(pixel[channel])[2:-1] + binary_secret_data[data_index], 2)
                            data_index += 1
                        else:
                            break
                            
        out.write(frame)
        
    cap.release()
    out.release()
    
    if data_index < data_len:
        raise ValueError("Pesan terlalu panjang untuk video ini.")
        
    return output_path

def extract_lsb_video(video_path):
    """
    Mengekstrak pesan rahasia dari video LSB stego (per frame).
    """
    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        raise ValueError("Video tidak ditemukan.")
        
    binary_data = ""
    
    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break
            
        for row in frame:
            for pixel in row:
                for channel in range(3):
                    binary_data += bin(pixel[channel])[-1]
                    
        # Konversi bits yang terkumpul di frame ini ke teks
        all_bytes = [binary_data[i: i+8] for i in range(0, len(binary_data), 8)]
        
        decoded_data = ""
        for byte in all_bytes:
            if len(byte) == 8:
                decoded_data += chr(int(byte, 2))
                if decoded_data[-11:] == "====EOF====":
                    cap.release()
                    return decoded_data[:-11]
                    
    cap.release()
    return "Pesan rahasia tidak ditemukan atau penanda EOF hilang."
