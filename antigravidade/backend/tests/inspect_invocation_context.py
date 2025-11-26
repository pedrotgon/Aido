import sys
import os
sys.path.append(os.getcwd())
from google.adk.agents import InvocationContext

with open("tests/invocation_context_fields.txt", "w") as f:
    try:
        f.write(str(InvocationContext.model_fields.keys()))
    except Exception as e:
        f.write(f"Error: {e}\n")
        f.write(f"Dir: {dir(InvocationContext)}")
