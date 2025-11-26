"""Test 03: Direct Pipeline API Call"""
import requests
import json
import time

def test_pipeline_via_api():
    """Test pipeline by calling the API directly."""
    url = "http://localhost:8000/pipeline/run"
    
    payload = {
        "doc_id": f"test_api_{int(time.time())}",
        "instructions": "Create a short safety manual for operating a hydraulic press. Include emergency stop procedures and safety gear requirements."
    }
    
    print("[TEST 03] Calling pipeline API...")
    print(f"[TEST 03] Payload: {json.dumps(payload, indent=2)}")
    
    response = requests.post(url, json=payload, stream=True, timeout=120)
    
    print(f"[TEST 03] Response status: {response.status_code}")
    
    events = []
    for line in response.iter_lines():
        if line:
            decoded = line.decode('utf-8')
            events.append(decoded)
            print(f"[TEST 03] Event: {decoded}")
    
    print(f"\n[TEST 03] Total events: {len(events)}")
    
    # Extract final data
    for event in events:
        if "event: complete" in event:
            print(f"[TEST 03] Pipeline completed successfully")
        if "manual_content" in event:
            # Extract JSON from data line
            if event.startswith("data:"):
                try:
                    data = json.loads(event[5:].strip())
                    print(f"[TEST 03] Manual content length: {len(data.get('manual_content', ''))}")
                    print(f"[TEST 03] Manual path: {data.get('manual_docx_path', 'N/A')}")
                    print(f"[TEST 03] Transcript path: {data.get('transcript_path', 'N/A')}")
                except:
                    pass

if __name__ == "__main__":
    test_pipeline_via_api()
    print("\n[TEST 03] Check backend terminal for [DEBUG] logs")
