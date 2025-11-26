import pytest
from fastapi.testclient import TestClient
from app.server import app

client = TestClient(app)
# Set a timeout for the client to avoid hanging on infinite streams
client.timeout = 5

def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok", "agent": "Aido"}

def test_cors_headers():
    response = client.options("/chat", headers={
        "Origin": "http://localhost:3000",
        "Access-Control-Request-Method": "POST"
    })
    assert response.status_code == 200
    assert response.headers["access-control-allow-origin"] == "*"

def test_chat_endpoint_structure():
    # Test basic structure, mocking the agent response would be ideal for unit tests
    # For integration, we check if it accepts the payload
    payload = {
        "message": "Hello",
        "history": []
    }
    # We expect a 200 OK and a streaming response
    with client.stream("POST", "/chat", json=payload) as response:
        assert response.status_code == 200
        # We might not get content if the agent is mocked or requires real credentials, 
        # but the connection should be established.

def test_sse_endpoint_connection():
    # Test connection to SSE endpoint
    with client.stream("GET", "/events/test_user") as response:
        assert response.status_code == 200
        assert response.headers["content-type"] == "text/event-stream"
        
        # Read first event
        for line in response.iter_lines():
            if line:
                decoded_line = line.decode('utf-8')
                # We expect at least a connection message or keep-alive
                assert "data:" in decoded_line or ": keep-alive" in decoded_line
                break
