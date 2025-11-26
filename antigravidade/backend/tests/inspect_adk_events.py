import sys
import os
sys.path.append(os.getcwd())
import google.adk.events

with open("tests/adk_events_dir.txt", "w") as f:
    f.write(str(dir(google.adk.events)))
