import asyncio
import os
from unittest.mock import MagicMock, patch

# Mock the tools before importing agents to avoid import errors or side effects
with patch('app.create.subagents.transcription.tools.transcribe_video.transcribe_video') as mock_transcribe, \
     patch('app.create.subagents.writer.tools.write_docx.write_docx') as mock_write:

    # Setup mocks
    mock_transcribe.return_value = "Texto transcrito do video."
    mock_write.return_value = {"status": "success", "output_path": "/mock/path/manual.docx"}

    # Import the agent under test
    from app.create.agent import create

    async def run_test():
        print("--- Starting Pipeline Test ---")
        input_text = "Processar video: e:\\AI\\aido\\antigravidade\\data\\entrada\\test_video.mp4"
        
        # Run the agent
        # Note: We use chat() as server.py does
        response = create.chat(input_text)
        
        print(f"--- Pipeline Response: {response} ---")
        
        # Verify tool calls
        print(f"Transcribe called: {mock_transcribe.called}")
        if mock_transcribe.called:
            print(f"Transcribe args: {mock_transcribe.call_args}")
            
        print(f"Write called: {mock_write.called}")
        if mock_write.called:
            print(f"Write args: {mock_write.call_args}")

    if __name__ == "__main__":
        asyncio.run(run_test())
