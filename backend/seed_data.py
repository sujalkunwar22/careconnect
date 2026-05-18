import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'careconnect.settings')
django.setup()

from users.models import User, NGOProfile
from jobs.models import Job

# 1. Create Superuser/Admin
if not User.objects.filter(username='admin').exists():
    admin = User.objects.create_superuser('admin', 'admin@test.com', 'admin123')
    admin.full_name = 'System Administrator'
    admin.role = 'admin'
    admin.save()
    print("Superuser created.")

# 2. Create User Sujal
if not User.objects.filter(email='sujal@gmail.com').exists():
    sujal = User.objects.create_user('sujal@gmail.com', 'sujal@gmail.com', 'Sujal123')
    sujal.role = 'professional'
    sujal.full_name = 'Sujal Paudel'
    sujal.save()
    print("User Sujal created.")

# 3. Create User Sita
if not User.objects.filter(email='sita.tamang@gmail.com').exists():
    sita = User.objects.create_user('sita.tamang@gmail.com', 'sita.tamang@gmail.com', 'User@12345')
    sita.role = 'professional'
    sita.full_name = 'Sita Tamang'
    sita.save()
    print("User Sita created.")

# 4. Create NGO
if not User.objects.filter(username='redcross').exists():
    ngo_user = User.objects.create_user('redcross', 'ngo@test.com', 'password123')
    ngo_user.role = 'ngo'
    ngo_user.full_name = 'Nepal Red Cross Society'
    ngo_user.save()
    NGOProfile.objects.create(
        user=ngo_user,
        organization_name='Nepal Red Cross Society',
        registration_number='NGO-12345',
        website='https://nrcs.org'
    )
    print("NGO user created.")
    
    # Add a sample job
    Job.objects.create(
        posted_by=ngo_user,
        title='Elderly Care Volunteer',
        description='Looking for compassionate volunteers to help seniors in Bhaktapur.',
        category='Elderly',
        location='Bhaktapur',
        employment_type='volunteer',
        requirements=['Compassion', 'Basic First Aid']
    )
    print("Sample job created.")

print("Seeding complete.")
