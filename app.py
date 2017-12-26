import json, os, requests
from pprint import pprint
import quickstart


test_id ='' 
rflan_id = ''
data = quickstart.main("main", '')

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
