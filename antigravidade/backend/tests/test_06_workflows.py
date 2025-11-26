"""Test 06: Verify 3 Mandatory Workflows"""
import requests
import json
import time
import os

API_URL = "http://localhost:8000/pipeline/run"

def run_workflow(name, payload):
    print(f"\n[TEST 06] --- Workflow: {name} ---")
    print(f"[TEST 06] Payload: {json.dumps(payload, indent=2)}")
    
    start_time = time.time()
    try:
        response = requests.post(API_URL, json=payload, stream=True, timeout=180)
        
        manual_content_len = 0
        docx_path = None
        
        for line in response.iter_lines():
            if line:
                decoded = line.decode('utf-8')
                if "event: complete" in decoded:
                    print(f"[TEST 06] ✓ Pipeline Completed")
                
                if decoded.startswith("data:"):
                    try:
                        data = json.loads(decoded[5:].strip())
                        if "manual_content" in data:
                            content = data.get("manual_content", "")
                            # Handle case where content might be a JSON string
                            if isinstance(content, str) and (content.startswith("{") or content.startswith('"')):
                                try:
                                    inner = json.loads(content)
                                    manual_content_len = len(str(inner))
                                except:
                                    manual_content_len = len(content)
                            else:
                                manual_content_len = len(str(content))
                                
                            docx_path = data.get("manual_docx_path")
                            print(f"[TEST 06] Manual Content Length: {manual_content_len}")
                            print(f"[TEST 06] DOCX Path: {docx_path}")
                        
                        if "log" in data:
                            # Print only key logs
                            if data.get("stage"):
                                print(f"[TEST 06] [{data['stage']}] {data['log']}")
                    except:
                        pass
                        
        duration = time.time() - start_time
        print(f"[TEST 06] Duration: {duration:.2f}s")
        
        if manual_content_len > 100 and docx_path and "placeholder" not in docx_path:
            print(f"[TEST 06] RESULT: PASS")
            return True
        else:
            print(f"[TEST 06] RESULT: FAIL (Empty content or missing DOCX)")
            return False
            
    except Exception as e:
        print(f"[TEST 06] RESULT: ERROR ({str(e)})")
        return False

def test_workflows():
    # 1. Video Only
    # We use a token or path. Since we are testing backend logic, we can pass the absolute path as token
    # assuming the backend handles it (it does via transcribe_video tool)
    video_path = "e:\\AI\\aido\\antigravidade\\data\\entrada\\google adk.mp4"
    
    # Workflow 1: Video Only
    w1 = run_workflow("Video Only", {
        "doc_id": f"test_w1_{int(time.time())}",
        "file_token": video_path
    })
    
    # Workflow 2: Video + Instructions
    w2 = run_workflow("Video + Instructions", {
        "doc_id": f"test_w2_{int(time.time())}",
        "file_token": video_path,
        "instructions": "Focus heavily on the 'Agent' class architecture."
    })
    
    # Workflow 3: Instructions Only
    w3 = run_workflow("Instructions Only", {
        "doc_id": f"test_w3_{int(time.time())}",
        "instructions": "Create a manual for a coffee machine. Include cleaning steps."
    })
    
    if w1 and w2 and w3:
        print("\n[TEST 06] ALL WORKFLOWS PASSED")
        exit(0)
    else:
        print("\n[TEST 06] SOME WORKFLOWS FAILED")
        exit(1)

if __name__ == "__main__":
    test_workflows()
