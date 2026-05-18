import requests
import time

url = "http://127.0.0.1:8000/api/jobs/"
try:
    start = time.time()
    response = requests.get(url, timeout=5)
    print(f"Status: {response.status_code}")
    print(f"Time: {time.time() - start:.2f}s")
    print(f"Count: {len(response.json())}")
except Exception as e:
    print(f"Error: {e}")
