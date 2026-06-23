import io
import numpy as np
from scipy.io import wavfile

def downsample_audio(audio_bytes: bytes, factor: int = 2) -> bytes:
    """
    Downsamples a WAV audio by reducing its sample rate and converting stereo to mono.
    Downsampling factor of 2 or 4 reduces sample rate by half or quarter.
    """
    # Read WAV from bytes
    sample_rate, data = wavfile.read(io.BytesIO(audio_bytes))
    
    # Ensure it is a copy so it's writable
    data = data.copy()
    
    # Convert stereo to mono if multi-channel (reduces size by half)
    if len(data.shape) > 1:
        # Average the channels and convert back to original data type
        data = data.mean(axis=1).astype(data.dtype)
        
    # Temporal decimation (downsample by keeping every nth sample)
    if factor < 1:
        factor = 1
    data = data[::factor]
    
    # Calculate new sample rate
    new_sample_rate = int(sample_rate // factor)
    
    # Write back to WAV format bytes
    output_buffer = io.BytesIO()
    wavfile.write(output_buffer, new_sample_rate, data)
    
    return output_buffer.getvalue()
