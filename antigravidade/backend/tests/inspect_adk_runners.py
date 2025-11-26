import sys
import os
sys.path.append(os.getcwd())
import google.adk.runners

with open("tests/adk_runners_dir.txt", "w") as f:
    f.write(str(dir(google.adk.runners)))
