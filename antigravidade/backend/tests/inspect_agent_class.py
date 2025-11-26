import sys
import os
sys.path.append(os.getcwd())
from google.adk.agents import Agent

with open("tests/agent_dir.txt", "w") as f:
    f.write(str([m for m in dir(Agent) if not m.startswith('_')]))
