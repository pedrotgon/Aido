import asyncio
import sys
import os

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../")))

from app.server import run_adhoc_agent

async def test():
    result = await run_adhoc_agent(
        name="TestAgent",
        instruction="You are a helpful assistant.",
        content="Write a short paragraph about safety procedures."
    )
    
    print(f"Result length: {len(result)}")
    print(f"Result: {result}")
    
    with open("tests/adhoc_test_result.txt", "w", encoding="utf-8") as f:
        f.write(f"Length: {len(result)}\n")
        f.write(f"Content:\n{result}")

if __name__ == "__main__":
    asyncio.run(test())
