import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch, MagicMock, AsyncMock
import json
import os

# Import app after setting up mocks if needed, but here we patch internally
from app.server import app

client = TestClient(app)

# Mock data
MOCK_DOC_ID = "test-doc-123"
MOCK_VIDEO_PATH = "e:\\AI\\aido\\antigravidade\\data\\entrada\\test.mp4"
MOCK_TRANSCRIPT = "Este é um texto transcrito de teste."
MOCK_STRUCTURED = "Capítulo 1: Teste\nConteúdo..."
MOCK_MASTERED = "Capítulo 1: Teste (Bosch Standard)\nConteúdo..."
MOCK_JSON = '{"titulo": "Manual Teste", "capitulos": []}'
MOCK_DOCX_PATH = "/data/saida/docx/Manual_Teste.docx"

@pytest.fixture
def mock_tools():
    with patch("app.server.transcribe_video", new_callable=AsyncMock) as mock_transcribe, \
         patch("app.server.write_docx", new_callable=AsyncMock) as mock_write, \
         patch("app.server.root_agent") as mock_agent:
        
        # Setup default behaviors
        mock_transcribe.return_value = MOCK_TRANSCRIPT
        mock_write.return_value = {"status": "success", "output_path": "e:\\AI\\aido\\antigravidade\\data\\saida\\docx\\Manual_Teste.docx"}
        
        # Mock root_agent.chat for intermediate steps
        # We need to handle multiple calls (Structuring, Mastering, JSON)
        mock_agent.chat.side_effect = [
            MagicMock(text=MOCK_STRUCTURED), # Structuring
            MagicMock(text=MOCK_MASTERED),   # Mastering
            MagicMock(text=MOCK_JSON)        # JSON Converter
        ]
        
        yield {
            "transcribe": mock_transcribe,
            "write": mock_write,
            "agent": mock_agent
        }

def test_pipeline_run_video_flow(mock_tools):
    """Test the full pipeline with video input."""
    payload = {
        "doc_id": MOCK_DOC_ID,
        "file_token": MOCK_VIDEO_PATH,
        "instructions": "Focar em segurança."
    }
    
    with client.stream("POST", "/pipeline/run", json=payload) as response:
        assert response.status_code == 200
        events = list(response.iter_lines())
        
        # Verify we get events
        assert len(events) > 0
        
        # Check for specific stages in the event stream
        combined_output = "".join([e.decode('utf-8') for e in events])
        assert "TRANSCRIPTION" in combined_output
        assert "STRUCTURING" in combined_output
        assert "MASTERING" in combined_output
        assert "WRITER" in combined_output
        assert "manual_docx_path" in combined_output
        
        # Verify tool calls
        mock_tools["transcribe"].assert_called_once_with(MOCK_VIDEO_PATH)
        mock_tools["write"].assert_called_once()
        assert mock_tools["agent"].chat.call_count == 3

def test_pipeline_run_text_flow(mock_tools):
    """Test the pipeline with text input (skipping transcription)."""
    payload = {
        "doc_id": MOCK_DOC_ID,
        "text_content": "Texto original fornecido pelo usuário.",
        "instructions": "Sem vídeo."
    }
    
    with client.stream("POST", "/pipeline/run", json=payload) as response:
        assert response.status_code == 200
        events = list(response.iter_lines())
        combined_output = "".join([e.decode('utf-8') for e in events])
        
        # Transcription should be skipped/mocked as "Usando texto fornecido"
        assert "Usando texto fornecido" in combined_output
        assert "STRUCTURING" in combined_output
        
        # Verify transcribe was NOT called
        mock_tools["transcribe"].assert_not_called()
        
        # Verify other steps ran
        assert mock_tools["agent"].chat.call_count == 3
        mock_tools["write"].assert_called_once()

def test_pipeline_run_instructions_only_flow(mock_tools):
    """Test the pipeline with instructions only."""
    payload = {
        "doc_id": MOCK_DOC_ID,
        "instructions": "Crie um manual sobre segurança de empilhadeiras."
    }
    
    with client.stream("POST", "/pipeline/run", json=payload) as response:
        assert response.status_code == 200
        events = list(response.iter_lines())
        combined_output = "".join([e.decode('utf-8') for e in events])
        
        assert "Usando instruções como conteúdo base" in combined_output
        assert "STRUCTURING" in combined_output
        
        mock_tools["transcribe"].assert_not_called()
        assert mock_tools["agent"].chat.call_count == 3
        mock_tools["write"].assert_called_once()

def test_pipeline_error_handling(mock_tools):
    """Test graceful failure if transcription fails."""
    mock_tools["transcribe"].return_value = "Error: File not found"
    
    payload = {
        "doc_id": MOCK_DOC_ID,
        "file_token": "invalid_path.mp4"
    }
    
    with client.stream("POST", "/pipeline/run", json=payload) as response:
        assert response.status_code == 200
        events = list(response.iter_lines())
        combined_output = "".join([e.decode('utf-8') for e in events])
        
        assert "event: error" in combined_output
        assert "File not found" in combined_output
        
        # Should stop before structuring
        mock_tools["agent"].chat.assert_not_called()
