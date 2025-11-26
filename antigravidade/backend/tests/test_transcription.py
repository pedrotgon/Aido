import pytest
from unittest.mock import MagicMock, patch
from app.services.transcription import TranscriptionService

@pytest.fixture
def mock_whisper():
    with patch("app.services.transcription.WhisperModel") as mock:
        yield mock

def test_transcribe_audio_success(mock_whisper):
    # Setup mock
    model_instance = mock_whisper.return_value
    
    # Mock segments
    Segment = MagicMock()
    Segment.text = "Hello world"
    Segment.start = 0.0
    Segment.end = 1.0
    
    model_instance.transcribe.return_value = ([Segment], MagicMock())
    
    service = TranscriptionService()
    result = service.transcribe("fake_audio.mp3")
    
    assert result == "Hello world"
    model_instance.transcribe.assert_called_once()

def test_transcribe_audio_empty(mock_whisper):
    model_instance = mock_whisper.return_value
    model_instance.transcribe.return_value = ([], MagicMock())
    
    service = TranscriptionService()
    result = service.transcribe("fake_audio.mp3")
    
    assert result == ""
