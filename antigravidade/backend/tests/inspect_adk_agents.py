import sys
import os
sys.path.append(os.getcwd())
import google.adk.agents

with open("tests/adk_agents_dir.txt", "w") as f:
    f.write(str(dir(google.adk.agents)))
