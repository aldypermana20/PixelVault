import numpy as np
import cv2
import pickle

def rle_encode(channel_array):
    """
    Run Length Encoding untuk array 1D.
    Menggunakan bytearray agar efisien dan ukurannya tidak membesar karena overhead struktur data Python.
    """
    pixels = channel_array.flatten()
    if len(pixels) == 0:
        return bytes()

    encoded = bytearray()
    prev_val = pixels[0]
    count = 1

    for i in range(1, len(pixels)):
        if pixels[i] == prev_val and count < 255:
            count += 1
        else:
            encoded.append(count)
            encoded.append(prev_val)
            prev_val = pixels[i]
            count = 1
    
    encoded.append(count)
    encoded.append(prev_val)
    return bytes(encoded)

def rle_decode(encoded_bytes, shape):
    """
    Run Length Decoding dari format biner kembali ke array 2D
    """
    decoded = bytearray()
    
    # Loop melewati setiap pasang (count, value)
    for i in range(0, len(encoded_bytes), 2):
        count = encoded_bytes[i]
        val = encoded_bytes[i+1]
        # Extend bytearray dengan 'val' sebanyak 'count'
        decoded.extend(bytes([val]) * count)
    
    img_array = np.frombuffer(decoded, dtype=np.uint8)
    return img_array.reshape(shape)

def compress_image_rle(image_path, output_path):
    """
    Membaca gambar, memisah channel BGR, mengenkripsi RLE, dan menyimpannya.
    """
    img = cv2.imread(image_path)
    if img is None:
        raise ValueError("Gambar tidak ditemukan atau format tidak valid")
    
    shape = img.shape
    b, g, r = cv2.split(img)
    
    encoded_b = rle_encode(b)
    encoded_g = rle_encode(g)
    encoded_r = rle_encode(r)
    
    data_to_save = {
        "shape": shape,
        "b": encoded_b,
        "g": encoded_g,
        "r": encoded_r
    }
    
    # Simpan menggunakan pickle ke format biner
    with open(output_path, "wb") as f:
        pickle.dump(data_to_save, f)
        
    return output_path

def decompress_image_rle(encoded_path, output_path):
    """
    Membaca data RLE dari file, melakukan dekode, dan menyimpan sebagai gambar.
    """
    with open(encoded_path, "rb") as f:
        data = pickle.load(f)
        
    shape = data["shape"]
    channel_shape = (shape[0], shape[1])
    
    b = rle_decode(data["b"], channel_shape)
    g = rle_decode(data["g"], channel_shape)
    r = rle_decode(data["r"], channel_shape)
    
    # Gabungkan kembali channel
    img = cv2.merge((b, g, r))
    cv2.imwrite(output_path, img)
    return output_path
