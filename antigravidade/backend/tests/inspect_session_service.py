import asyncio
import sys
import os
sys.path.append(os.getcwd())
from google.adk.runners import InMemoryRunner
from google.adk.agents import Agent

async def test():
    agent = Agent(name="Test", model="gemini-2.5-flash")
    runner = InMemoryRunner(agent=agent)
    with open("tests/session_service_dir.txt", "w") as f:
        f.write(str([m for m in dir(runner.session_service) if not m.startswith('_')]))

if __name__ == "__main__":
    asyncio.run(test())
