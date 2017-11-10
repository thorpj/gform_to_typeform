import json, os, requests
from pprint import pprint
import quickstart


test_id = "12t8I-ZEVtqp9acgFHbHWrjoez6e95fAQ"
rflan_id = "0B6Mq9VEROVC-OWY4MTU3NjctZDI1Ny00Nzg1LWE4YWYtZDg0MzJiZjA3ZGM3"
data = quickstart.main("main", test_id)

# try:
# data = data.decode('utf-8')
# data = json.loads(data)
# except (ValueError, AttributeError):
#     print("Data is not valid JSON")


pprint(data)


exit(0)
with open(os.path.join(".", "config.json"), 'r') as f:
    config = json.load(f)

base_url = "https://api.typeform.com"

req = requests.post("{}/forms".format(base_url), data=data)
