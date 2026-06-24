import wave

def embed_lsb_audio(audio_path, secret_data, output_path):
    """
    Menyisipkan teks rahasia ke dalam file Audio (WAV) menggunakan metode LSB.
    """
    song = wave.open(audio_path, mode='rb')
    frame_bytes = bytearray(list(song.readframes(song.getnframes())))
    
    secret_data += "====EOF===="
    binary_secret_data = ''.join([format(ord(i), "08b") for i in secret_data])
    
    if len(binary_secret_data) > len(frame_bytes):
        raise ValueError("Pesan terlalu panjang untuk kapasitas audio ini.")
        
    # Ubah bit LSB untuk tiap byte dari frame audio
    for i in range(len(binary_secret_data)):
        res = bin(frame_bytes[i])[2:-1] + binary_secret_data[i]
        frame_bytes[i] = int(res, 2)
        
    frame_modified = bytes(frame_bytes)
    
    # Simpan kembali ke file output
    with wave.open(output_path, 'wb') as fd:
        fd.setparams(song.getparams())
        fd.writeframes(frame_modified)
        
    song.close()
    return output_path

def extract_lsb_audio(audio_path):
    """
    Mengekstrak pesan rahasia dari file Audio (WAV) LSB stego.
    """
    song = wave.open(audio_path, mode='rb')
    frame_bytes = bytearray(list(song.readframes(song.getnframes())))
    
    extracted = [bin(frame_bytes[i])[-1] for i in range(len(frame_bytes))]
    binary_data = "".join(extracted)
    
    all_bytes = [binary_data[i: i+8] for i in range(0, len(binary_data), 8)]
    
    decoded_data = ""
    for byte in all_bytes:
        decoded_data += chr(int(byte, 2))
        if decoded_data[-11:] == "====EOF====":
            song.close()
            return decoded_data[:-11]
            
    song.close()
    return "Pesan rahasia tidak ditemukan atau penanda EOF hilang."
