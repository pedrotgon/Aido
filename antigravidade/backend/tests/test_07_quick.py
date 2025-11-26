"""Test 07: Quick Instructions Only Workflow"""
import requests
import json
import time

API_URL = "http://localhost:8000/pipeline/run"

def test_quick_workflow():
    payload = {
        "doc_id": f"quick_test_{int(time.time())}",
        "instructions": "Create a very short safety manual for a hammer. Just one chapter."
    }
    
    print(f"[TEST 07] Sending payload: {json.dumps(payload)}")
    
    try:
        response = requests.post(API_URL, json=payload, stream=True, timeout=60)
        
        for line in response.iter_lines():
            if line:
                decoded = line.decode('utf-8')
                if "event: complete" in decoded:
                    print("[TEST 07] ✓ Pipeline Completed")
                    return True
                if "event: error" in decoded:
                    print(f"[TEST 07] ✗ Pipeline Error: {decoded}")
                    return False
                    
    except Exception as e:
        print(f"[TEST 07] Error: {e}")
        return False

if __name__ == "__main__":
    if test_quick_workflow():
        print("[TEST 07] PASSED")
        exit(0)
    else:
        print("[TEST 07] FAILED")
        exit(1)
