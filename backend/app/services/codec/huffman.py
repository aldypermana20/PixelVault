import heapq
import pickle
import os

class HuffmanNode:
    def __init__(self, char, freq):
        self.char = char
        self.freq = freq
        self.left = None
        self.right = None

    def __lt__(self, other):
        return self.freq < other.freq

def build_frequency_dict(data):
    freq = {}
    for byte in data:
        if byte not in freq:
            freq[byte] = 0
        freq[byte] += 1
    return freq

def build_huffman_tree(freq_dict):
    heap = [HuffmanNode(char, freq) for char, freq in freq_dict.items()]
    heapq.heapify(heap)

    if len(heap) == 1:
        node = heapq.heappop(heap)
        root = HuffmanNode(None, node.freq)
        root.left = node
        return root

    while len(heap) > 1:
        node1 = heapq.heappop(heap)
        node2 = heapq.heappop(heap)
        
        merged = HuffmanNode(None, node1.freq + node2.freq)
        merged.left = node1
        merged.right = node2
        heapq.heappush(heap, merged)

    return heap[0] if heap else None

def build_codes(node, current_code="", codes=None):
    if codes is None:
        codes = {}
    if node is None:
        return codes
    if node.char is not None:
        codes[node.char] = current_code
    build_codes(node.left, current_code + "0", codes)
    build_codes(node.right, current_code + "1", codes)
    return codes

def huffman_encode(data):
    if not data:
        return b"", {}, 0
    
    freq_dict = build_frequency_dict(data)
    root = build_huffman_tree(freq_dict)
    codes = build_codes(root)
    
    encoded_text = "".join(codes[byte] for byte in data)
    
    # Padding agar panjang bit menjadi kelipatan 8
    padding = 8 - (len(encoded_text) % 8)
    if padding == 8:
        padding = 0
    encoded_text += "0" * padding
    
    # Konversi string biner ke bytes
    b_array = bytearray()
    for i in range(0, len(encoded_text), 8):
        byte = encoded_text[i:i+8]
        b_array.append(int(byte, 2))
        
    return bytes(b_array), freq_dict, padding

def huffman_decode(encoded_bytes, freq_dict, padding):
    if not encoded_bytes and not freq_dict:
        return b""
        
    # Konversi bytes kembali ke string biner
    encoded_text = "".join(f"{byte:08b}" for byte in encoded_bytes)
        
    # Hapus padding
    if padding > 0:
        encoded_text = encoded_text[:-padding]
        
    root = build_huffman_tree(freq_dict)
    
    decoded_data = bytearray()
    current_node = root
    
    if root.char is not None:
        # Kasus spesial jika hanya ada 1 karakter unik
        return bytes([root.char] * freq_dict[root.char])
        
    for bit in encoded_text:
        if bit == '0':
            current_node = current_node.left
        else:
            current_node = current_node.right
            
        if current_node.char is not None:
            decoded_data.append(current_node.char)
            current_node = root
            
    return bytes(decoded_data)

def compress_file_huffman(input_path, output_path):
    """
    Fungsi utilitas untuk mengkompresi file apa saja (seperti Audio/Video) 
    menggunakan Huffman secara binary-safe.
    """
    with open(input_path, "rb") as f:
        data = f.read()
        
    encoded_bytes, freq_dict, padding = huffman_encode(data)
    
    data_to_save = {
        "freq": freq_dict,
        "pad": padding,
        "data": encoded_bytes
    }
    
    with open(output_path, "wb") as f:
        pickle.dump(data_to_save, f)
        
    return output_path

def decompress_file_huffman(input_path, output_path):
    """
    Fungsi utilitas untuk mendekompresi file biner Huffman.
    """
    with open(input_path, "rb") as f:
        data_saved = pickle.load(f)
        
    decoded_bytes = huffman_decode(
        data_saved["data"], 
        data_saved["freq"], 
        data_saved["pad"]
    )
    
    with open(output_path, "wb") as f:
        f.write(decoded_bytes)
        
    return output_path

import cv2
import numpy as np
import math

def compress_image_huffman(image_path, output_path, ratio=100):
    img = cv2.imread(image_path)
    if img is None:
        raise ValueError("Gambar tidak ditemukan atau format tidak valid")
        
    if ratio < 100:
        scale_factor = math.sqrt(ratio / 100.0)
        img = cv2.resize(img, (0, 0), fx=scale_factor, fy=scale_factor, interpolation=cv2.INTER_AREA)
    
    shape = img.shape
    b, g, r = cv2.split(img)
    
    b_data = b.tobytes()
    g_data = g.tobytes()
    r_data = r.tobytes()
    
    enc_b, freq_b, pad_b = huffman_encode(b_data)
    enc_g, freq_g, pad_g = huffman_encode(g_data)
    enc_r, freq_r, pad_r = huffman_encode(r_data)
    
    data_to_save = {
        "shape": shape,
        "b": {"data": enc_b, "freq": freq_b, "pad": pad_b},
        "g": {"data": enc_g, "freq": freq_g, "pad": pad_g},
        "r": {"data": enc_r, "freq": freq_r, "pad": pad_r}
    }
    
    with open(output_path, "wb") as f:
        pickle.dump(data_to_save, f)
        
    return output_path

def decompress_image_huffman(encoded_path, output_path):
    with open(encoded_path, "rb") as f:
        data = pickle.load(f)
        
    shape = data["shape"]
    channel_shape = (shape[0], shape[1])
    
    b_dict = data["b"]
    g_dict = data["g"]
    r_dict = data["r"]
    
    dec_b = huffman_decode(b_dict["data"], b_dict["freq"], b_dict["pad"])
    dec_g = huffman_decode(g_dict["data"], g_dict["freq"], g_dict["pad"])
    dec_r = huffman_decode(r_dict["data"], r_dict["freq"], r_dict["pad"])
    
    b = np.frombuffer(dec_b, dtype=np.uint8).reshape(channel_shape)
    g = np.frombuffer(dec_g, dtype=np.uint8).reshape(channel_shape)
    r = np.frombuffer(dec_r, dtype=np.uint8).reshape(channel_shape)
    
    img = cv2.merge((b, g, r))
    cv2.imwrite(output_path, img)
    return output_path
