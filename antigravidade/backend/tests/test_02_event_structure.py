"""Test 02: Event Structure Inspection"""
import asyncio
import sys
import os

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../")))

from google.adk.agents import Agent
from google.adk.runners import InMemoryRunner

class SimpleMessage:
    def __init__(self, text, role="user"):
        self.role = role
        self.parts = [{"text": text}]
    def model_copy(self, **kwargs):
        return self

async def inspect_event_structure():
    """Inspect the structure of events from InMemoryRunner."""
    print("[TEST 02] Creating agent and runner...")
    
    agent = Agent(
        name="EventInspector",
        model="gemini-2.5-flash",
        instruction="You are a helpful assistant. Respond briefly."
    )
    
    runner = InMemoryRunner(agent=agent, app_name="EventInspector")
    
    session_id = "inspect_session"
    await runner.session_service.create_session(
        session_id=session_id,
        user_id="system",
        app_name="EventInspector"
    )
    
    msg = SimpleMessage("Write exactly one sentence about safety.")
    
    print("[TEST 02] Running agent and collecting events...")
    events = []
    
    async for event in runner.run_async(
        user_id="system",
        session_id=session_id,
        new_message=msg
    ):
        events.append(event)
        print(f"[TEST 02] Event #{len(events)}: {type(event)}")
        print(f"[TEST 02]   dir(event): {[attr for attr in dir(event) if not attr.startswith('_')]}")
        
        # Try to extract content
        if hasattr(event, 'content'):
            print(f"[TEST 02]   event.content type: {type(event.content)}")
            print(f"[TEST 02]   event.content: {event.content}")
            
            if event.content and hasattr(event.content, 'parts'):
                print(f"[TEST 02]   event.content.parts: {event.content.parts}")
                if event.content.parts:
                    for i, part in enumerate(event.content.parts):
                        print(f"[TEST 02]     part[{i}] type: {type(part)}")
                        if hasattr(part, 'text'):
                            print(f"[TEST 02]     part[{i}].text: {part.text}")
    
    print(f"\n[TEST 02] Total events collected: {len(events)}")
    
    # Try to extract all text
    all_text = ""
    for event in events:
        if hasattr(event, 'content') and event.content:
            if hasattr(event.content, 'parts') and event.content.parts:
                for part in event.content.parts:
                    if hasattr(part, 'text'):
                        all_text += part.text
    
    print(f"[TEST 02] Extracted text length: {len(all_text)}")
    print(f"[TEST 02] Extracted text: {all_text}")
    
    return all_text

if __name__ == "__main__":
    result = asyncio.run(inspect_event_structure())
    print(f"\n[TEST 02] PASSED - Extracted: {len(result)} chars")
