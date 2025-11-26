import asyncio
import os
import sys

# Add backend to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../")))

from app.create.subagents.transcription.tools.transcribe_video import transcribe_video

async def test():
    video_path = "E:\\AI\\aido\\antigravidade\\data\\entrada\\google adk.mp4"
    print(f"Testing transcription for: {video_path}")
    
    # Check file existence
    if os.path.exists(video_path):
        print("File exists.")
    else:
        print("File DOES NOT exist.")
        
    # Run transcription
    result = await transcribe_video(video_path)
    print(f"Result: {result[:200]}...")

if __name__ == "__main__":
    asyncio.run(test())
