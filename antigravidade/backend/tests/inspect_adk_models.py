import sys
import os
sys.path.append(os.getcwd())
import google.adk.models

with open("tests/adk_models_dir.txt", "w") as f:
    f.write(str(dir(google.adk.models)))
