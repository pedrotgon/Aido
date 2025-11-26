import asyncio
import sys
import os
sys.path.append(os.getcwd())
from google.adk.agents import Agent

async def test():
    try:
        agent = Agent(name="Test", model="gemini-2.5-flash")
        events = []
        async for event in agent.run_async("Hello"):
            events.append(event)
        
        with open("tests/agent_response.txt", "w") as f:
            f.write(f"Count: {len(events)}\n")
            for i, e in enumerate(events):
                f.write(f"Event {i}: {e}\n")
    except Exception as e:
        with open("tests/agent_response.txt", "w") as f:
            f.write(f"Error: {e}\n")

if __name__ == "__main__":
    asyncio.run(test())
