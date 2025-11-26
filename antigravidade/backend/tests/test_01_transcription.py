"""Test 01: Transcription Tool"""
import asyncio
import os
import sys

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../")))

from app.create.subagents.transcription.tools.transcribe_video import transcribe_video

async def test_transcription_real_video():
    """Test transcription with real video file."""
    video_path = "E:\\AI\\aido\\antigravidade\\data\\entrada\\google adk.mp4"
    
    print(f"[TEST 01] Testing transcription with: {video_path}")
    print(f"[TEST 01] File exists: {os.path.exists(video_path)}")
    
    result = await transcribe_video(video_path)
    
    # Assertions
    assert not result.startswith("Error"), f"Transcription failed: {result}"
    assert len(result) > 0, "Transcription is empty"
    assert len(result) > 100, f"Transcription too short: {len(result)} chars"
    
    print(f"[TEST 01] OK Transcription successful: {len(result)} chars")
    print(f"[TEST 01] Preview: {result[:200]}...")
    
    return result

if __name__ == "__main__":
    result = asyncio.run(test_transcription_real_video())
    print(f"\n[TEST 01] PASSED - Transcription: {len(result)} chars")
