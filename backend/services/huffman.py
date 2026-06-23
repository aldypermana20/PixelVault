import heapq
import struct
from collections import Counter
from typing import Tuple, Dict, Any

class HuffmanNode:
    def __init__(self, symbol: int = None, freq: int = 0):
        self.symbol = symbol
        self.freq = freq
        self.left = None
        self.right = None

    # Define comparison operators for priority queue (min-heap)
    def __lt__(self, other):
        return self.freq < other.freq

def build_tree(frequencies: Dict[int, int]) -> HuffmanNode:
    heap = []
    for symbol, freq in frequencies.items():
        heapq.heappush(heap, HuffmanNode(symbol, freq))
    
    if not heap:
        return None
        
    while len(heap) > 1:
        left = heapq.heappop(heap)
        right = heapq.heappop(heap)
        parent = HuffmanNode(freq=left.freq + right.freq)
        parent.left = left
        parent.right = right
        heapq.heappush(heap, parent)
        
    return heap[0]

def generate_codebook(node: HuffmanNode, code: str = "", codebook: Dict[int, str] = None) -> Dict[int, str]:
    if codebook is None:
        codebook = {}
    
    if node is None:
        return codebook
        
    # If it's a leaf node
    if node.left is None and node.right is None:
        codebook[node.symbol] = code or "0"  # Handle single symbol case
    else:
        generate_codebook(node.left, code + "0", codebook)
        generate_codebook(node.right, code + "1", codebook)
        
    return codebook

def compress_bytes(data: bytes) -> bytes:
    """
    Compresses a byte sequence using Huffman Coding.
    Output binary format:
      - 4 bytes: Magic string b'HUFF'
      - 2 bytes: Number of unique symbols N (uint16)
      - N * 5 bytes: For each symbol: 1 byte symbol + 4 bytes frequency (uint32)
      - 1 byte: Number of padding bits (0-7)
      - Remaining bytes: Packed bitstream
    """
    if not data:
        # Return empty custom format if no data
        return struct.pack(">4sH", b"HUFF", 0)

    # 1. Count frequencies
    frequencies = dict(Counter(data))
    
    # 2. Build Huffman tree & codebook
    root = build_tree(frequencies)
    codebook = generate_codebook(root)
    
    # 3. Encode data to bitstring
    bit_list = [codebook[byte] for byte in data]
    bit_string = "".join(bit_list)
    
    # 4. Calculate padding
    padding = (8 - len(bit_string) % 8) % 8
    bit_string += "0" * padding
    
    # 5. Pack bitstring into bytes
    packed_bytes = bytearray()
    for i in range(0, len(bit_string), 8):
        byte_val = int(bit_string[i:i+8], 2)
        packed_bytes.append(byte_val)
        
    # 6. Build the custom binary structure
    header = bytearray()
    # Magic + count of symbols
    header.extend(struct.pack(">4sH", b"HUFF", len(frequencies)))
    
    # Symbol table: (symbol, frequency)
    for symbol, freq in frequencies.items():
        header.extend(struct.pack(">BI", symbol, freq))
        
    # Padding bits count
    header.extend(struct.pack(">B", padding))
    
    return bytes(header + packed_bytes)

def decompress_bytes(compressed_data: bytes) -> bytes:
    """
    Decompresses Huffman compressed data.
    """
    if len(compressed_data) < 6:
        raise ValueError("Invalid compressed file size.")
        
    # 1. Read header (Magic + N)
    magic, num_symbols = struct.unpack(">4sH", compressed_data[:6])
    if magic != b"HUFF":
        raise ValueError("File is not a valid PixelVault Huffman file.")
        
    if num_symbols == 0:
        return b""
        
    offset = 6
    frequencies = {}
    
    # 2. Read symbol table
    for _ in range(num_symbols):
        if offset + 5 > len(compressed_data):
            raise ValueError("Corrupt file header: symbol table is truncated.")
        symbol, freq = struct.unpack(">BI", compressed_data[offset:offset+5])
        frequencies[symbol] = freq
        offset += 5
        
    # 3. Read padding
    if offset + 1 > len(compressed_data):
        raise ValueError("Corrupt file header: missing padding byte.")
    padding = struct.unpack(">B", compressed_data[offset:offset+1])[0]
    offset += 1
    
    # 4. Reconstruct Huffman tree
    root = build_tree(frequencies)
    
    # 5. Unpack bitstream
    packed_data = compressed_data[offset:]
    bit_string_parts = []
    for byte in packed_data:
        bit_string_parts.append(f"{byte:08b}")
    
    bit_string = "".join(bit_string_parts)
    if padding > 0:
        bit_string = bit_string[:-padding]
        
    # 6. Decode bitstream using Huffman tree
    decoded_bytes = bytearray()
    
    # Special case: only 1 unique symbol
    if len(frequencies) == 1:
        symbol = list(frequencies.keys())[0]
        count = frequencies[symbol]
        return bytes([symbol] * count)
        
    current_node = root
    for bit in bit_string:
        if bit == "0":
            current_node = current_node.left
        else:
            current_node = current_node.right
            
        if current_node.left is None and current_node.right is None:
            decoded_bytes.append(current_node.symbol)
            current_node = root
            
    return bytes(decoded_bytes)
