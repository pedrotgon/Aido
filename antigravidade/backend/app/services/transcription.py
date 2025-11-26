import os
from faster_whisper import WhisperModel

class TranscriptionService:
    def __init__(self, model_size="tiny", device="cpu", compute_type="int8"):
        self.model = WhisperModel(model_size, device=device, compute_type=compute_type)

    def transcribe(self, audio_path: str) -> str:
        segments, info = self.model.transcribe(audio_path, beam_size=5)
        
        text = []
        for segment in segments:
            text.append(segment.text)
            
        return " ".join(text).strip()
