import requests
import json

BASE = "http://localhost:8000"

# Step 1: Register
print("=== REGISTER ===")
r = requests.post(f"{BASE}/auth/register", json={"email": "test@example.com", "password": "test123456"})
print(f"Status: {r.status_code}")
print(f"Body: {r.text}")

# Step 2: Login
print("\n=== LOGIN ===")
r = requests.post(f"{BASE}/auth/login", json={"email": "test@example.com", "password": "test123456"})
print(f"Status: {r.status_code}")
print(f"Body: {r.text}")
data = r.json()
token = data.get("access_token", "")
print(f"Token: {token[:50]}...")

# Step 3: List questions
print("\n=== QUESTIONS ===")
r = requests.get(f"{BASE}/questions/", headers={"Authorization": f"Bearer {token}"})
print(f"Status: {r.status_code}")
problems = r.json()
for p in problems:
    pid = p.get("_id", p.get("id", ""))
    print(f"  - {p['title']} (id={pid}, difficulty={p['difficulty']})")

# Find Two Sum
two_sum = [p for p in problems if p["title"] == "Two Sum"]
if two_sum:
    problem_id = two_sum[0].get("_id", two_sum[0].get("id", ""))
    print(f"\nTwo Sum problem_id: {problem_id}")

    # Step 4: Create session
    print("\n=== CREATE SESSION ===")
    r = requests.post(f"{BASE}/sessions/create", json={"candidate_email": "test@example.com", "problem_id": problem_id})
    print(f"Status: {r.status_code}")
    print(f"Body: {r.text}")
else:
    print("Two Sum not found!")
