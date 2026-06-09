import requests
url='http://127.0.0.1:5000/api/chat'
headers={'Content-Type':'application/json'}
data={'messages':[{'role':'user','content':'Hello'}],'system':'You are helpful'}
try:
    resp=requests.post(url, json=data, headers=headers, timeout=60)
    print(resp.status_code)
    print(resp.text)
except Exception as e:
    print('ERR', e)
