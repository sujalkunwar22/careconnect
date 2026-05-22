import os
import sys
import django

# Add parent directory to sys.path to find careconnect
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

# Set up Django environment
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "careconnect.settings")
django.setup()

from django.contrib.auth import get_user_model

User = get_user_model()

def run():
    print("--- Starting database mirroring verification ---")
    
    # 1. Create a user on default
    username = "test_mirror_user_123"
    email = "test_mirror@example.com"
    
    # Clean up if already exists
    User.objects.using('default').filter(username=username).delete()
    User.objects.using('sqlite_backup').filter(username=username).delete()
    
    print("Creating test user on default database...")
    user = User(
        username=username,
        email=email,
        role="seeker",
        full_name="Test Mirror User"
    )
    user.set_password("TestPassword123!")
    user.save(using='default')
    print(f"Created user with ID: {user.pk} on default.")
    
    # Check if mirrored to sqlite_backup
    try:
        mirrored_user = User.objects.using('sqlite_backup').get(username=username)
        print(f"SUCCESS: Mirrored user found on sqlite_backup! ID: {mirrored_user.pk}, email: {mirrored_user.email}")
    except User.DoesNotExist:
        print("FAIL: Mirrored user NOT found on sqlite_backup!")
        return
        
    # 2. Update user on default
    print("Updating user on default...")
    user.full_name = "Updated Test Mirror User"
    user.save(using='default')
    
    # Verify update on sqlite_backup
    mirrored_user.refresh_from_db(using='sqlite_backup')
    if mirrored_user.full_name == "Updated Test Mirror User":
        print(f"SUCCESS: Update mirrored! full_name is '{mirrored_user.full_name}' on sqlite_backup.")
    else:
        print(f"FAIL: Update NOT mirrored! full_name is '{mirrored_user.full_name}' on sqlite_backup.")
        return
        
    # 3. Delete user on default
    print("Deleting user on default...")
    user.delete(using='default')
    
    # Verify delete on sqlite_backup
    exists = User.objects.using('sqlite_backup').filter(username=username).exists()
    if not exists:
        print("SUCCESS: Deletion mirrored! User no longer exists on sqlite_backup.")
    else:
        print("FAIL: Deletion NOT mirrored! User still exists on sqlite_backup.")
        
    print("--- Database mirroring verification completed ---")

if __name__ == "__main__":
    run()
