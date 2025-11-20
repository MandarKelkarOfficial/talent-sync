import requests, json, os

url = 'http://127.0.0.1:8000/verify'
file_path = os.path.join('..','uploads','1757745079260-Mandar_Kelkar.pdf')
if not os.path.exists(file_path):
    print('Sample PDF not found:', file_path)
    exit(1)

metadata = {
    "studentId": "650f1f3a6c8e4b9f1a2b3c4d",
    "providedName": "Rutuja Patwari"
}

with open(file_path, 'rb') as f:
    files = {'file': ('LY_A_69_Rutuja_Patwari.pdf', f, 'application/pdf')}
    data = {'metadata': json.dumps(metadata)}
    headers = {'X-User': 'Rutuja Patwari'}
    r = requests.post(url, files=files, data=data, headers=headers)
    print('Status:', r.status_code)
    print('Response:', r.text)
