import sys
import os
import inspect
sys.path.append(os.getcwd())
import google.adk.types as types

# Try to find InvocationContext in types or agents
try:
    from google.adk.types import InvocationContext
    print("Found in types")
    print(InvocationContext.model_fields.keys())
except ImportError:
    try:
        from google.adk.agents import InvocationContext
        print("Found in agents")
        print(InvocationContext.model_fields.keys())
    except ImportError:
        print("Could not find InvocationContext")
        print("google.adk.types members:", dir(types))
