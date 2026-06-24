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

def embed_lsb_image(image_path, secret_data, output_path):
    """
    Menyisipkan teks rahasia ke dalam gambar menggunakan metode LSB.
    """
    img = cv2.imread(image_path)
    if img is None:
        raise ValueError("Gambar tidak ditemukan.")
    
    # Penanda akhir pesan (End Of File)
    secret_data += "====EOF===="
    binary_secret_data = msg_to_bin(secret_data)
    data_len = len(binary_secret_data)
    
    data_index = 0
    
    for row in img:
        for pixel in row:
            for channel in range(3):
                if data_index < data_len:
                    # Ganti LSB dari nilai pixel dengan bit rahasia
                    pixel[channel] = int(bin(pixel[channel])[2:-1] + binary_secret_data[data_index], 2)
                    data_index += 1
                if data_index >= data_len:
                    # Jika semua pesan sudah dimasukkan, simpan gambar
                    cv2.imwrite(output_path, img)
                    return output_path
    
    raise ValueError("Pesan terlalu panjang, melebihi kapasitas gambar.")

def extract_lsb_image(image_path):
    """
    Mengekstrak pesan rahasia dari gambar LSB stego.
    """
    img = cv2.imread(image_path)
    if img is None:
        raise ValueError("Gambar tidak ditemukan.")
        
    binary_data = ""
    for row in img:
        for pixel in row:
            for channel in range(3):
                binary_data += bin(pixel[channel])[-1]
                
    # Membagi biner menjadi kelompok 8-bit (1 byte)
    all_bytes = [binary_data[i: i+8] for i in range(0, len(binary_data), 8)]
    
    decoded_data = ""
    for byte in all_bytes:
        decoded_data += chr(int(byte, 2))
        # Jika menemukan penanda EOF, kembalikan pesan
        if decoded_data[-11:] == "====EOF====":
            return decoded_data[:-11]
            
    return "Pesan rahasia tidak ditemukan atau penanda EOF hilang."
