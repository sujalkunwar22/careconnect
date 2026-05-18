import os
import django
import sys
import traceback

sys.path.append(os.getcwd())
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'careconnect.settings')
django.setup()

from django.test import Client

client = Client()
try:
    response = client.get('/api/jobs/?limit=5')
    print(f"Status: {response.status_code}")
    print(f"Content: {response.content}")
except Exception as e:
    traceback.print_exc()
