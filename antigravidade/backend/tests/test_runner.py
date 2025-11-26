import asyncio
import sys
import os
sys.path.append(os.getcwd())
from google.adk.runners import InMemoryRunner
from google.adk.agents import Agent

async def test():
    try:
        agent = Agent(name="Test", model="gemini-2.5-flash")
        runner = InMemoryRunner(agent=agent)
        
        with open("tests/runner_dir.txt", "w") as f:
            f.write(str([m for m in dir(runner) if not m.startswith('_')]))
            
        # Try to run with a simple message
        # Assuming run_async takes user_id, session_id, message
        response_gen = runner.run_async(user_id="user1", session_id="sess1", new_message="Hello")
        
        events = []
        async for event in response_gen:
            events.append(event)
            
        with open("tests/runner_response.txt", "w") as f:
            f.write(f"Events: {len(events)}\n")
            for e in events:
                f.write(f"{e}\n")
                
    except Exception as e:
        with open("tests/runner_error.txt", "w") as f:
            f.write(f"Error: {e}\n")

if __name__ == "__main__":
    asyncio.run(test())
