import requests
import time
import concurrent.futures

BASE_URL = "http://localhost:8000/api/v1"

def test_login_rate_limit():
    url = f"{BASE_URL}/auth/login"
    payload = {
        "username": "admin",
        "password": "wrongpassword"
    }
    
    print(f"Testing rate limit on {url}...")
    
    def make_request():
        try:
            response = requests.post(url, json=payload)
            return response.status_code
        except Exception as e:
            return str(e)

    # We expect limit to be 5 per minute
    with concurrent.futures.ThreadPoolExecutor(max_workers=10) as executor:
        futures = [executor.submit(make_request) for _ in range(10)]
        results = [f.result() for f in futures]
    
    success_count = results.count(401) # Unauthorized (wrong password) is a 'success' for the limiter
    rate_limited_count = results.count(429)
    
    print(f"Results: {results}")
    print(f"Unauthorized (401): {success_count}")
    print(f"Rate Limited (429): {rate_limited_count}")
    
    if rate_limited_count > 0:
        print("✅ Rate limiting is WORKING!")
    else:
        print("❌ Rate limiting NOT detected (is the server running and configured?)")

if __name__ == "__main__":
    test_login_rate_limit()
