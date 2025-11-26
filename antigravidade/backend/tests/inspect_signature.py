import sys
import os
import inspect
sys.path.append(os.getcwd())
from google.adk.agents import Agent

with open("tests/agent_sig.txt", "w") as f:
    try:
        sig = inspect.signature(Agent.run_async)
        f.write(str(sig))
    except Exception as e:
        f.write(str(e))
