"""Test 04: Inspect Backend Logs"""
import subprocess
import time

# Since backend might be running in a different terminal,
# let's make another API call and capture the response details
import requests
import json

def test_with_detailed_logging():
    url = "http://localhost:8000/pipeline/run"
    
    payload = {
        "doc_id": f"debug_test_{int(time.time())}",
        "instructions": "Write a two-paragraph safety manual about wearing helmets."
    }
    
    print("[TEST 04] Calling pipeline...")
    response = requests.post(url, json=payload, stream=True, timeout=120)
    
    for line in response.iter_lines():
        if line:
            decoded = line.decode('utf-8')
            print(decoded)
            
            # Check for error events
            if "error" in decoded.lower():
                print(f"[TEST 04] ERROR DETECTED: {decoded}")

if __name__ == "__main__":
    print("[TEST 04] Starting pipeline test with logging...")
    print("[TEST 04] Watch the backend terminal for [DEBUG] logs")
    print("=" * 60)
    test_with_detailed_logging()
