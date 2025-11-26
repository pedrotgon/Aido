import asyncio
import sys
import os
sys.path.append(os.getcwd())
from google.adk.runners import InMemoryRunner
from google.adk.agents import Agent

class MockMessage:
    def __init__(self, text):
        self.role = "user"
        self.parts = [{"text": text}]
    
    def model_copy(self, **kwargs):
        return self

async def test():
    try:
        agent = Agent(name="TestAgent", model="gemini-2.5-flash")
        runner = InMemoryRunner(agent=agent)
        
        print(f"Runner app_name: {runner.app_name}")
        
        # Create session with runner.app_name
        runner.session_service.create_session_sync(session_id="s1", user_id="u1", app_name=runner.app_name)
        
        # Verify
        sess = runner.session_service.get_session_sync(session_id="s1", user_id="u1", app_name=runner.app_name)
        print(f"Session created: {sess}")
        
        msg = MockMessage("Hello")
        
        response_gen = runner.run_async(user_id="u1", session_id="s1", new_message=msg)
        
        events = []
        async for event in response_gen:
            events.append(event)
            
        with open("tests/runner_content_response.txt", "w") as f:
            f.write(f"Events: {len(events)}\n")
            for e in events:
                f.write(f"{e}\n")
                
    except Exception as e:
        print(f"Caught exception: {e}")
        with open("tests/runner_content_error.txt", "w") as f:
            f.write(f"Error: {e}\n")

if __name__ == "__main__":
    asyncio.run(test())
