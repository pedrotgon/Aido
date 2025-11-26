import pytest
import os
import time
import shutil
from fastapi.testclient import TestClient
from app.server import app

# Use TestClient but it will call REAL services since we are NOT mocking app.server dependencies
client = TestClient(app)

# Setup paths
DATA_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../data"))
UPLOAD_DIR = os.path.join(DATA_DIR, "entrada")
OUTPUT_DIR = os.path.join(DATA_DIR, "saida")
MANUALS_DIR = os.path.join(OUTPUT_DIR, "docx")
TRANSCRIPTS_DIR = os.path.join(OUTPUT_DIR, "txt")

# Ensure directories exist
os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(MANUALS_DIR, exist_ok=True)
os.makedirs(TRANSCRIPTS_DIR, exist_ok=True)

# Test Data
TEST_DOC_ID = f"test_real_{int(time.time())}"
TEST_TEXT_CONTENT = "O operador deve sempre usar EPIs. A empilhadeira deve ser verificada antes do uso. Em caso de falha, acione a manutenção."
TEST_INSTRUCTIONS = "Crie um manual curto e direto."

def test_real_pipeline_text_flow():
    """
    Tests the full pipeline using REAL agents (Gemini) and REAL file generation.
    Uses text input to avoid long transcription times, but exercises the full logic.
    """
    print(f"\n--- Starting Real Pipeline Test: {TEST_DOC_ID} ---")
    
    payload = {
        "doc_id": TEST_DOC_ID,
        "text_content": TEST_TEXT_CONTENT,
        "instructions": TEST_INSTRUCTIONS
    }
    
    # We use stream=True to consume the SSE
    with client.stream("POST", "/pipeline/run", json=payload) as response:
        assert response.status_code == 200
        
        events = []
        for line in response.iter_lines():
            if line:
                if isinstance(line, bytes):
                    decoded_line = line.decode('utf-8')
                else:
                    decoded_line = line
                print(f"Received: {decoded_line}")
                events.append(decoded_line)
        
        combined_output = "".join(events)
        
        # 1. Verify Stages
        assert "TRANSCRIPTION" in combined_output
        assert "STRUCTURING" in combined_output
        assert "MASTERING" in combined_output
        assert "WRITER" in combined_output
        assert "complete" in combined_output
        
        # 2. Verify Output Files
        # Extract manual path from logs or construct it
        # The writer uses the title from the JSON. 
        # Since we can't predict the exact title Gemini generates, we check if ANY .docx was created recently in the folder
        # OR we check if the response contains "manual_docx_path" and verify that file.
        
        assert "manual_docx_path" in combined_output
        
        # Check if a file was actually created in MANUALS_DIR
        files = os.listdir(MANUALS_DIR)
        assert len(files) > 0, "No DOCX files found in output directory"
        print(f"Found generated manuals: {files}")

def test_real_upload_endpoint():
    """Test uploading a real dummy file."""
    dummy_content = b"fake mp4 content"
    filename = "test_upload_real.mp4"
    
    files = {"file": (filename, dummy_content, "video/mp4")}
    data = {"doc_id": "upload_test_123"}
    
    response = client.post("/upload", files=files, data=data)
    assert response.status_code == 200
    json_resp = response.json()
    
    assert json_resp["filename"] == filename
    assert os.path.exists(os.path.join(UPLOAD_DIR, filename))
    
    # Cleanup
    try:
        os.remove(os.path.join(UPLOAD_DIR, filename))
    except:
        pass

if __name__ == "__main__":
    # Allow running directly
    test_real_upload_endpoint()
    test_real_pipeline_text_flow()
