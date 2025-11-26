import sys
import os
sys.path.append(os.getcwd())
import google.adk

with open("tests/adk_dir.txt", "w") as f:
    f.write(str(dir(google.adk)))
