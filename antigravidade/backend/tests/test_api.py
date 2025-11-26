import pytest
from fastapi.testclient import TestClient
from unittest.mock import MagicMock, patch
from app.main import app

client = TestClient(app)

@pytest.fixture
def mock_pipeline():
    with patch("app.api.endpoints.pipeline.PipelineService") as mock:
        yield mock

def test_upload_file_success(mock_pipeline):
    # Mock the pipeline processing
    mock_instance = mock_pipeline.return_value
    mock_instance.process_file.return_value = {"id": "123", "status": "processing"}
    
    files = {"file": ("test.mp4", b"fake video content", "video/mp4")}
    response = client.post("/api/pipeline/upload", files=files)
    
    assert response.status_code == 200
    assert response.json()["status"] == "processing"

def test_get_manual_content(mock_pipeline):
    mock_instance = mock_pipeline.return_value
    mock_instance.get_result.return_value = {
        "content": "# Manual\n\nTest content",
        "status": "completed"
    }
    
    response = client.get("/api/pipeline/123/content")
    
    assert response.status_code == 200
    assert "Manual" in response.json()["content"]
