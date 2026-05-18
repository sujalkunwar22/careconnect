import os
import django
import sys

# Setup Django
sys.path.append(os.getcwd())
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'careconnect.settings')
django.setup()

from users.serializers import LoginSerializer
from rest_framework import serializers

def test_login(identifier, password):
    data = {
        'identifier': identifier,
        'password': password
    }
    serializer = LoginSerializer(data=data)
    try:
        if serializer.is_valid(raise_exception=True):
            print(f"SUCCESS: Validated user {serializer.validated_data['user']}")
    except serializers.ValidationError as e:
        print(f"ERROR: {e.detail}")
    except Exception as e:
        print(f"CRITICAL: {str(e)}")

if __name__ == "__main__":
    print("Testing LoginSerializer with 'admin' / 'admin123'...")
    test_login('admin', 'admin123')
    
    print("\nTesting LoginSerializer with empty identifier...")
    test_login('', 'admin123')
