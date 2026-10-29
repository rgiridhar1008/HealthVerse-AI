import os
import sys
import time
import uuid
import requests

if sys.stdout.encoding.lower() != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

BASE_URL = os.getenv("GATEWAY_URL", "http://localhost:8080")

print("============================================================")
print(" HEALTHVERSE AI -- AUTOMATED COMPREHENSIVE TEST SUITE")
print(f" Gateway URL: {BASE_URL}")
print("============================================================")

test_id = str(uuid.uuid4())[:8]
test_email = f"test.user.{test_id}@healthverse.ai"
test_password = "Password@123"
test_name = f"Test Runner {test_id}"

results = []

def record(test_name: str, passed: bool, detail: str = ""):
    status = "PASS" if passed else "FAIL"
    results.append({"name": test_name, "status": status, "detail": detail})
    mark = "[OK]" if passed else "[FAIL]"
    print(f"{mark} {status}: {test_name}")
    if detail:
        print(f"    Detail: {detail}")

# -------------------------------------------------------------
# 1. AUTHENTICATION TEST (Registration & Login)
# -------------------------------------------------------------
token = None
user_id = None
try:
    reg_res = requests.post(
        f"{BASE_URL}/api/auth/register",
        json={"name": test_name, "email": test_email, "password": test_password},
        timeout=10
    )
    if reg_res.status_code in [200, 201]:
        data = reg_res.json()
        token = data.get("accessToken") or data.get("token")
        user_id = data.get("user", {}).get("id")
        record("1. User Registration", True, f"Registered {test_email} (userId: {user_id})")
    else:
        record("1. User Registration", False, f"Status {reg_res.status_code}: {reg_res.text}")

    # Verify Login
    login_res = requests.post(
        f"{BASE_URL}/api/auth/login",
        json={"email": test_email, "password": test_password},
        timeout=10
    )
    if login_res.status_code == 200:
        login_data = login_res.json()
        token = login_data.get("accessToken") or login_data.get("token")
        user_id = login_data.get("user", {}).get("id")
        record("2. User Login & JWT Issuance", True, f"Issued token prefix: {token[:16]}...")
    else:
        record("2. User Login & JWT Issuance", False, f"Status {login_res.status_code}: {login_res.text}")

except Exception as e:
    record("1/2. Auth Flow Exception", False, str(e))

if not token:
    print("Cannot proceed without valid auth token. Exiting.")
    sys.exit(1)

headers = {"Authorization": f"Bearer {token}"}

# -------------------------------------------------------------
# 2. HEALTH PROFILE PERSISTENCE TEST
# -------------------------------------------------------------
try:
    profile_payload = {
        "age": 29,
        "gender": "Female",
        "height": 168.0,
        "weight": 62.5,
        "lifestyle": "Moderately Active",
        "goals": "Maintenance",
        "allergies": "Penicillin",
        "conditions": "None",
        "dietaryPreference": "Mediterranean",
        "sleepPattern": "7-9 hours",
        "bloodGroup": "O+",
        "currentMedications": "Vitamin D3 2000IU daily"
    }

    put_res = requests.put(f"{BASE_URL}/api/health/profile", json=profile_payload, headers=headers, timeout=10)
    if put_res.status_code in [200, 201]:
        record("3. Update Health Profile", True, "Profile saved with Blood Group and Medications")
    else:
        record("3. Update Health Profile", False, f"Status {put_res.status_code}: {put_res.text}")

    get_res = requests.get(f"{BASE_URL}/api/health/profile", headers=headers, timeout=10)
    if get_res.status_code == 200:
        p = get_res.json()
        bg_ok = p.get("bloodGroup") == "O+"
        med_ok = p.get("currentMedications") == "Vitamin D3 2000IU daily"
        age_ok = p.get("age") == 29
        if bg_ok and med_ok and age_ok:
            record("4. Verify Profile Persistence After Refresh", True, f"BloodGroup: {p.get('bloodGroup')}, Meds: {p.get('currentMedications')}")
        else:
            record("4. Verify Profile Persistence After Refresh", False, f"Field mismatch in: {p}")
    else:
        record("4. Verify Profile Persistence After Refresh", False, f"Status {get_res.status_code}: {get_res.text}")
except Exception as e:
    record("3/4. Profile Exception", False, str(e))

# -------------------------------------------------------------
# 3. DAILY HEALTH TRACKING & UPSERT TEST
# -------------------------------------------------------------
today = time.strftime("%Y-%m-%d")
try:
    vitals_payload = {
        "date": today,
        "weight": 62.5,
        "sleepHours": 7.5,
        "steps": 8500,
        "waterIntake": 2.4,
        "exerciseMinutes": 35,
        "mood": "Excellent"
    }
    vitals_res = requests.post(f"{BASE_URL}/api/health/daily", json=vitals_payload, headers=headers, timeout=10)
    if vitals_res.status_code in [200, 201]:
        record("5. Log Daily Vitals", True, f"Logged {today}: 8500 steps, 7.5h sleep")
    else:
        record("5. Log Daily Vitals", False, f"Status {vitals_res.status_code}: {vitals_res.text}")

    # Test Upsert: re-submit for the same date with updated steps
    vitals_payload["steps"] = 10200
    upsert_res = requests.post(f"{BASE_URL}/api/health/daily", json=vitals_payload, headers=headers, timeout=10)
    if upsert_res.status_code in [200, 201]:
        data = upsert_res.json()
        if data.get("steps") == 10200:
            record("6. Daily Vitals Idempotent Upsert", True, "Successfully updated existing date record without 400 error")
        else:
            record("6. Daily Vitals Idempotent Upsert", False, f"Steps not updated: {data}")
    else:
        record("6. Daily Vitals Idempotent Upsert", False, f"Status {upsert_res.status_code}: {upsert_res.text}")
except Exception as e:
    record("5/6. Daily Tracking Exception", False, str(e))

# -------------------------------------------------------------
# 4. MEDICATION MANAGEMENT CRUD TEST
# -------------------------------------------------------------
med_id = None
try:
    med_payload = {
        "name": "Metformin",
        "dosage": "500mg",
        "frequency": "Twice daily with meals",
        "timeOfDay": "Morning and Evening",
        "startDate": today,
        "instructions": "Take with full glass of water",
        "active": True
    }
    add_med_res = requests.post(f"{BASE_URL}/api/health/medications", json=med_payload, headers=headers, timeout=10)
    if add_med_res.status_code in [200, 201]:
        med_data = add_med_res.json()
        med_id = med_data.get("id")
        record("7. Add Medication Record", True, f"Added Metformin 500mg (medId: {med_id})")
    else:
        record("7. Add Medication Record", False, f"Status {add_med_res.status_code}: {add_med_res.text}")

    list_med_res = requests.get(f"{BASE_URL}/api/health/medications", headers=headers, timeout=10)
    if list_med_res.status_code == 200:
        meds = list_med_res.json()
        found = any(m.get("name") == "Metformin" for m in meds)
        record("8. List Active Medications", found, f"Total active meds: {len(meds)}")
    else:
        record("8. List Active Medications", False, f"Status {list_med_res.status_code}: {list_med_res.text}")
except Exception as e:
    record("7/8. Medication CRUD Exception", False, str(e))

# -------------------------------------------------------------
# 5. DIGITAL HEALTH TWIN VERIFICATION
# -------------------------------------------------------------
try:
    twin_res = requests.get(f"{BASE_URL}/api/health-twin/status", headers=headers, timeout=10)
    if twin_res.status_code == 200:
        t = twin_res.json()
        score = t.get("overallWellnessScore")
        record("9. Digital Health Twin Score Calculation", True, f"Wellness Score: {score}/100, Status: {t.get('status')}")
    else:
        record("9. Digital Health Twin Score Calculation", False, f"Status {twin_res.status_code}: {twin_res.text}")

    comp_res = requests.get(f"{BASE_URL}/api/health-twin/comprehensive", headers=headers, timeout=10)
    if comp_res.status_code == 200:
        c = comp_res.json()
        meds_present = len(c.get("medications", [])) > 0
        vitals_present = len(c.get("vitals", [])) > 0
        record("10. Digital Health Twin Real Data Sync", meds_present and vitals_present,
               f"Synced vitals: {len(c.get('vitals', []))}, synced meds: {len(c.get('medications', []))}")
    else:
        record("10. Digital Health Twin Real Data Sync", False, f"Status {comp_res.status_code}: {comp_res.text}")
except Exception as e:
    record("9/10. Twin Exception", False, str(e))

# -------------------------------------------------------------
# 6. NUTRITION & FITNESS & WELLNESS PLANS
# -------------------------------------------------------------
try:
    nut_res = requests.get(f"{BASE_URL}/api/nutrition/plans", headers=headers, timeout=10)
    record("11. Nutrition Plan Query", nut_res.status_code == 200, f"Status: {nut_res.status_code}, Found: {len(nut_res.json()) if nut_res.status_code == 200 else 0}")

    fit_res = requests.get(f"{BASE_URL}/api/fitness/plans", headers=headers, timeout=10)
    record("12. Fitness Plan Query", fit_res.status_code == 200, f"Status: {fit_res.status_code}, Found: {len(fit_res.json()) if fit_res.status_code == 200 else 0}")

    well_res = requests.get(f"{BASE_URL}/api/wellness/insights", headers=headers, timeout=60)
    if well_res.status_code == 200:
        w_data = well_res.json()
        if isinstance(w_data, list):
            w_data = w_data[0] if len(w_data) > 0 else {}
        record("13. Predictive Wellness Insights", True, f"Area: {w_data.get('area')}, Trend: {w_data.get('trend')}")
    else:
        record("13. Predictive Wellness Insights", False, f"Status {well_res.status_code}: {well_res.text}")
except Exception as e:
    record("11-13. Plans Exception", False, str(e))

# -------------------------------------------------------------
# 7. AI DIRECT CHAT TEST
# -------------------------------------------------------------
try:
    chat_payload = {
        "message": "Hello, what are some simple hydration tips for active lifestyle?",
        "history": []
    }
    chat_res = requests.post(f"{BASE_URL}/api/analysis/chat", json=chat_payload, headers=headers, timeout=180)
    if chat_res.status_code == 200:
        c_data = chat_res.json()
        msg = c_data.get("response") or c_data.get("message")
        record("14. AI Direct Chat", bool(msg), f"AI Response: {str(msg)[:80]}...")
    else:
        record("14. AI Direct Chat", False, f"Status {chat_res.status_code}: {chat_res.text}")
except Exception as e:
    record("14. AI Chat Exception", False, str(e))

# -------------------------------------------------------------
# 8. SYMPTOM ANALYZER TEST (With Real Demographic Profile)
# -------------------------------------------------------------
try:
    symptom_payload = {
        "symptoms": "Mild headache and sinus pressure after prolonged screen work",
        "duration": "1 day",
        "severity": "Mild",
        "age": 29,
        "weight": 62.5,
        "height": 168.0,
        "allergies": ["Penicillin"],
        "chronic_conditions": []
    }
    sym_res = requests.post(f"{BASE_URL}/api/analysis/symptoms", json=symptom_payload, headers=headers, timeout=180)
    if sym_res.status_code in [200, 201]:
        sym_data = sym_res.json()
        has_insights = bool(sym_data.get("insights") or sym_data.get("recommendations"))
        record("15. Symptom Analyzer with Real Profile Context", has_insights, f"Insights: {str(sym_data.get('insights'))[:80]}...")
    else:
        record("15. Symptom Analyzer with Real Profile Context", False, f"Status {sym_res.status_code}: {sym_res.text}")
except Exception as e:
    record("15. Symptom Analyzer Exception", False, str(e))

# -------------------------------------------------------------
# 9. MEDICAL REPORT PDF UPLOAD & EXTRACTION TEST
# -------------------------------------------------------------
pdf_path = "HealthVerse_AI_Sample_Medical_Report.pdf"
try:
    if os.path.exists(pdf_path):
        with open(pdf_path, "rb") as f:
            files = {"file": (os.path.basename(pdf_path), f, "application/pdf")}
            data = {
                "reportType": "COMPLETE_BLOOD_COUNT",
                "reportDate": today,
                "description": "Automated verification test lab report"
            }
            upload_res = requests.post(f"{BASE_URL}/api/reports/upload", files=files, data=data, headers=headers, timeout=30)
            if upload_res.status_code in [200, 201]:
                up_data = upload_res.json()
                report_id = up_data.get("id")
                record("16. Medical Report PDF GridFS Upload", True, f"Stored report ID: {report_id}")

                # Trigger report analysis
                analyze_res = requests.post(f"{BASE_URL}/api/analysis/reports/{report_id}/analyze", headers=headers, timeout=15)
                if analyze_res.status_code in [200, 201]:
                    record("17. Trigger Medical Report Analysis", True, f"Analysis job queued for {report_id}")
                else:
                    record("17. Trigger Medical Report Analysis", False, f"Status {analyze_res.status_code}: {analyze_res.text}")
            else:
                record("16. Medical Report PDF GridFS Upload", False, f"Status {upload_res.status_code}: {upload_res.text}")
    else:
        record("16. Medical Report PDF GridFS Upload", False, f"PDF file not found at {pdf_path}")
except Exception as e:
    record("16/17. Report Flow Exception", False, str(e))

# -------------------------------------------------------------
# SUMMARY REPORT
# -------------------------------------------------------------
print("\n" + "="*60)
print(" TEST SUMMARY")
print("="*60)
passed_count = sum(1 for r in results if r["status"] == "PASS")
total_count = len(results)
print(f"Results: {passed_count}/{total_count} PASSED")

if passed_count == total_count:
    print("ALL TESTS PASSED SUCCESSFULLY! 100% HEALTH VERIFIED.")
    sys.exit(0)
else:
    print("SOME TESTS FAILED. Review output above.")
    sys.exit(1)
