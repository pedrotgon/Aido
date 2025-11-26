import pytest
import os
import time
from fastapi.testclient import TestClient
from app.server import app

# Use TestClient with real app
client = TestClient(app)

# Paths
DATA_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../data"))
UPLOAD_DIR = os.path.join(DATA_DIR, "entrada")
OUTPUT_DOCX_DIR = os.path.join(DATA_DIR, "saida", "docx")

# Ensure output dir exists
os.makedirs(OUTPUT_DOCX_DIR, exist_ok=True)

# Helper to parse SSE
def run_pipeline_and_wait(payload):
    print(f"--- Running Pipeline for {payload['doc_id']} ---")
    events = []
    docx_path = None
    
    with client.stream("POST", "/pipeline/run", json=payload) as response:
        assert response.status_code == 200, f"Failed to start pipeline: {response.text}"
        
        for line in response.iter_lines():
            if line:
                decoded = line.decode('utf-8') if isinstance(line, bytes) else line
                print(f"Stream: {decoded}")
                events.append(decoded)
                
                if "manual_docx_path" in decoded:
                    # Extract path roughly
                    import json
                    try:
                        if decoded.startswith("data:"):
                            data = json.loads(decoded[5:].strip())
                            docx_path = data.get("manual_docx_path")
                    except:
                        pass

    return events, docx_path

def test_story_a_video_upload():
    """
    Story A: User uploads MP4 -> Pipeline runs -> DOCX generated.
    """
    doc_id = f"story_a_{int(time.time())}"
    video_filename = "tiny_test.mp4"
    video_path = os.path.join(UPLOAD_DIR, video_filename)
    
    # 1. Upload (Simulate file placement by API or check existence)
    # The API /upload moves file to UPLOAD_DIR. We already created it there via ffmpeg.
    # But let's call the API to get the "file_token" (which is just the path in this implementation)
    
    # Simulate Upload
    with open(video_path, "rb") as f:
        response = client.post("/upload", files={"file": (video_filename, f, "video/mp4")}, data={"doc_id": doc_id})
        assert response.status_code == 200
        upload_data = response.json()
        file_token = upload_data["file_token"]
        
    # 2. Run Pipeline
    payload = {
        "doc_id": doc_id,
        "file_token": file_token,
        "instructions": "Resumo do video."
    }
    
    events, docx_path = run_pipeline_and_wait(payload)
    
    # 3. Verify
    assert any("TRANSCRIPTION" in e for e in events), "Transcription step missing"
    assert any("WRITER" in e for e in events), "Writer step missing"
    assert any("complete" in e for e in events), "Pipeline did not complete"
    
    assert docx_path and docx_path != "/placeholder.docx", "Invalid DOCX path returned"
    # Verify file exists on disk
    # docx_path from API is like "/data/saida/docx/..." relative to some root or absolute?
    # The server returns `/data/saida/docx/...` which is relative to project root usually for frontend.
    # Let's construct absolute path.
    
    # The server implementation of `write_docx` returns absolute path, 
    # but the SSE event constructs a web-friendly path.
    # Let's look for ANY new .docx in the output folder.
    
    files = os.listdir(OUTPUT_DOCX_DIR)
    assert len(files) > 0
    print(f"Generated files: {files}")

def test_story_b_audio_instructions():
    """
    Story B: User uploads MP3 + Instructions -> Pipeline runs -> DOCX generated.
    """
    doc_id = f"story_b_{int(time.time())}"
    audio_filename = "tiny_test.mp3"
    audio_path = os.path.join(UPLOAD_DIR, audio_filename)
    
    with open(audio_path, "rb") as f:
        response = client.post("/upload", files={"file": (audio_filename, f, "audio/mpeg")}, data={"doc_id": doc_id})
        assert response.status_code == 200
        file_token = response.json()["file_token"]
        
    payload = {
        "doc_id": doc_id,
        "file_token": file_token,
        "instructions": "Foque apenas nos aspectos de segurança mencionados no áudio."
    }
    
    events, docx_path = run_pipeline_and_wait(payload)
    
    full_log = "".join(str(e) for e in events)
    assert "TRANSCRIPTION" in full_log
    # Verify we got a completion
    assert "complete" in full_log

def test_story_c_instructions_only():
    """
    Story C: User provides ONLY instructions -> Pipeline runs -> DOCX generated.
    """
    doc_id = f"story_c_{int(time.time())}"
    
    payload = {
        "doc_id": doc_id,
        "instructions": "Crie um manual completo sobre como fazer café. Inclua passos de moagem e filtragem."
    }
    
    events, docx_path = run_pipeline_and_wait(payload)
    
    assert any("Usando instruções como conteúdo base" in e for e in events)
    assert any("WRITER" in e for e in events)
    assert any("complete" in e for e in events)
