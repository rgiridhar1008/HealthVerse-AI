import requests
import json
import random
from datetime import datetime, timedelta

BASE_URL = "http://localhost:8080"

# Demo User Details
DEMO_EMAIL = "rgiridhar@gmail.com"
DEMO_PASSWORD = "giridhar@1234"
DEMO_NAME = "R Giridhar"

def main():
    print("--- HealthVerse-AI Demo User Seeder ---")

    # 1. Register User
    print(f"1. Registering {DEMO_EMAIL}...")
    reg_payload = {
        "email": DEMO_EMAIL,
        "password": DEMO_PASSWORD,
        "name": DEMO_NAME
    }
    # It might already exist, so we catch errors
    res = requests.post(f"{BASE_URL}/api/auth/register", json=reg_payload)
    if res.status_code not in [200, 201]:
        print(f"Registration returned {res.status_code} (User might already exist): {res.text}")
    else:
        print("Registration successful.")

    # 2. Login
    print("2. Logging in...")
    login_payload = {
        "email": DEMO_EMAIL,
        "password": DEMO_PASSWORD
    }
    res = requests.post(f"{BASE_URL}/api/auth/login", json=login_payload)
    if res.status_code != 200:
        print(f"Login failed! Status: {res.status_code}, Response: {res.text}")
        return
    token = res.json().get("accessToken")
    headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
    print("Login successful.")

    # 3. Create/Update Profile
    print("3. Updating Health Profile...")
    profile_payload = {
        "age": 20,
        "gender": "Male",
        "height": 170.0,
        "weight": 82.0,
        "lifestyle": "Moderately Active",
        "goals": "Improve overall health and fitness",
        "allergies": "None",
        "conditions": "None",
        "sleepPattern": "7-8 hours",
        "dietaryPreference": "Balanced"
    }
    res = requests.put(f"{BASE_URL}/api/health/profile", json=profile_payload, headers=headers)
    if res.status_code in [200, 201]:
        print("Profile updated successfully.")
    else:
        print(f"Failed to update profile: {res.status_code} {res.text}")

    # 4. Generate 30 days of daily health data
    print("4. Seeding 30 days of Health Data...")
    today = datetime.now()
    current_weight = 82.8
    for i in range(30, -1, -1):
        d_date = today - timedelta(days=i)
        
        # Add realistic variance
        steps = random.randint(5000, 12000)
        sleep = round(random.uniform(6.0, 8.5), 1)
        water = round(random.uniform(2.0, 3.5), 1)
        exercise = random.randint(15, 60)
        mood = random.choice(["Great", "Good", "Okay", "Stressed", "Energetic"])
        
        # Slight weight trend downwards
        current_weight -= random.uniform(0.01, 0.04)
        
        daily_payload = {
            "date": d_date.strftime("%Y-%m-%d"),
            "weight": round(current_weight, 1),
            "sleepHours": sleep,
            "steps": steps,
            "waterIntake": water,
            "exerciseMinutes": exercise,
            "mood": mood
        }
        # First try PUT (update), if 404/fail, try POST
        res = requests.put(f"{BASE_URL}/api/health/daily/{daily_payload['date']}", json=daily_payload, headers=headers)
        if res.status_code not in [200, 201]:
             requests.post(f"{BASE_URL}/api/health/daily", json=daily_payload, headers=headers)
    print("Health Data seeded successfully.")

    # 5. Generate Plans via AI
    print("5. Generating AI Nutrition Plan...")
    nutri_payload = {
        "dietaryPreferences": ["Balanced"],
        "allergies": [],
        "goal": "Support fitness"
    }
    requests.post(f"{BASE_URL}/api/nutrition/plans/generate", json=nutri_payload, headers=headers)
    print("Nutrition Plan generated.")

    print("6. Generating AI Fitness Plan...")
    fit_payload = {
        "goal": "Build strength and improve fitness",
        "level": "intermediate",
        "days": 4
    }
    requests.post(f"{BASE_URL}/api/fitness/plans/generate", json=fit_payload, headers=headers)
    print("Fitness Plan generated.")

    print("7. Generating AI Wellness Plan...")
    well_payload = {
        "goal": "Improve sleep/stress"
    }
    requests.post(f"{BASE_URL}/api/wellness/plans/generate", json=well_payload, headers=headers)
    print("Wellness Plan generated.")

    # 6. Upload Medical Report
    print("8. Uploading and Analyzing Medical Report...")
    pdf_content = b"%PDF-1.4\n1 0 obj\n<<>>\nendobj\ntrailer\n<<>>\n%%EOF"
    files = {"file": ("demo_blood_test.pdf", pdf_content, "application/pdf")}
    report_data = {
        "reportType": "Annual Blood Test",
        "reportDate": (today - timedelta(days=2)).strftime("%Y-%m-%d"),
        "description": "Routine annual blood checkup."
    }
    # Drop Content-Type to allow multipart form data to automatically set boundaries
    report_headers = {"Authorization": f"Bearer {token}"}
    res = requests.post(f"{BASE_URL}/api/reports/upload", headers=report_headers, files=files, data=report_data)
    if res.status_code in [200, 201]:
        report_id = res.json().get("id")
        if report_id:
            res_analysis = requests.post(f"{BASE_URL}/api/analysis/reports/{report_id}/analyze", headers=headers)
            if res_analysis.status_code in [200, 201]:
                print("Medical report uploaded and analyzed.")
            else:
                print(f"Analysis failed: {res_analysis.status_code}")
    else:
        print(f"Report upload failed: {res.status_code}")

    print("\n--- Demo User Seed Complete ---")

if __name__ == "__main__":
    main()
