import requests
import time
import json

base_url = 'http://localhost:8080'
token = "eyJhbGciOiJIUzM4NCJ9.eyJyb2xlIjoiVVNFUiIsIm5hbWUiOiJUZXN0IFVzZXIiLCJ1c2VySWQiOjQsInN1YiI6InRlc3R1c2VyQGV4YW1wbGUuY29tIiwiaWF0IjoxNzkwMTkxMDQwLCJleHAiOjE3OTAyNzc0NDB9.gILVWAxKOz-BAUOLIoSZr-BD5Hj6-xiqeI3Fo_88DPGCFkW5MGECxLAIb2U_ki-R"
headers = {'Authorization': f'Bearer {token}'}

def test_wellness():
    print("Testing Wellness...")
    data = {'goal': 'Reduce stress'}
    res = requests.post(f"{base_url}/api/wellness/plans/generate", headers=headers, json=data)
    print(f"Status: {res.status_code}")
    print(f"Response: {res.text[:100]}...\n")

def test_fitness():
    print("Testing Fitness...")
    data = {'goal': 'Build muscle', 'level': 'intermediate', 'days': 3}
    res = requests.post(f"{base_url}/api/fitness/plans/generate", headers=headers, json=data)
    print(f"Status: {res.status_code}")
    print(f"Response: {res.text[:100]}...\n")

def test_nutrition():
    print("Testing Nutrition...")
    data = {'dietaryPreferences': ['vegetarian'], 'allergies': [], 'goal': 'Weight loss'}
    res = requests.post(f"{base_url}/api/nutrition/plans/generate", headers=headers, json=data)
    print(f"Status: {res.status_code}")
    print(f"Response: {res.text[:100]}...\n")

def test_reports():
    print("Testing Medical Reports...")
    files = {'file': ('test.pdf', b'%PDF-1.4\n1 0 obj\n<<>>\nendobj\ntrailer\n<<>>\n%%EOF', 'application/pdf')}
    data = {'reportType': 'GENERAL_BLOOD_TEST', 'reportDate': '2023-10-01', 'description': 'test'}
    res1 = requests.post(f"{base_url}/api/reports/upload", headers=headers, files=files, data=data)
    print(f"Upload Status: {res1.status_code}")
    if res1.status_code == 200 or res1.status_code == 201:
        report_id = res1.json().get('id')
        if report_id:
            res2 = requests.post(f"{base_url}/api/analysis/reports/{report_id}/analyze", headers=headers)
            print(f"Analyze Status: {res2.status_code}")
            print(f"Analyze Response: {res2.text[:100]}...\n")
        else:
            print("Failed to get report_id.")
    else:
        print(f"Failed to upload report. Response: {res1.text}")

if __name__ == '__main__':
    test_wellness()
    test_fitness()
    test_nutrition()
    test_reports()
