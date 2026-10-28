import urllib.request
import json

url = 'http://localhost:8000/api/v1/agents/report/analyze'
data = json.dumps({'report_text': 'Patient has high cholesterol and low vitamin D. Blood pressure is 120/80.'}).encode('utf-8')
req = urllib.request.Request(url, data=data, headers={'Content-Type': 'application/json'})
try:
    with urllib.request.urlopen(req) as response:
        print("Success:", response.read().decode('utf-8'))
except Exception as e:
    print("Error:", e)
