import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'careconnect.settings')
django.setup()

from users.models import User, NGOProfile
from jobs.models import Job

def seed():
    # Create NGOs
    ngos_data = [
        {'username': 'redcross', 'full_name': 'Red Cross Nepal', 'email': 'contact@redcross.org.np'},
        {'username': 'usaid', 'full_name': 'USAID Nepal', 'email': 'info@usaid.gov.np'},
        {'username': 'savethechildren', 'full_name': 'Save the Children', 'email': 'hr@savethechildren.org.np'},
    ]

    ngos = []
    for data in ngos_data:
        user, created = User.objects.get_or_create(
            username=data['username'],
            defaults={
                'email': data['email'],
                'full_name': data['full_name'],
                'role': User.Roles.NGO,
                'is_active': True,
                'is_kyc_verified': True
            }
        )
        if created:
            user.set_password('password123')
            user.save()
            NGOProfile.objects.get_or_create(
                user=user,
                defaults={
                    'organization_name': data['full_name'],
                    'description': f'Leading humanitarian organization: {data["full_name"]}',
                    'is_verified': True
                }
            )
        ngos.append(user)

    # Create Jobs
    jobs_data = [
        {
            'title': 'Senior Project Manager',
            'location': 'Kathmandu',
            'salary_min': 80000,
            'salary_max': 120000,
            'employment_type': Job.EmploymentType.FULL_TIME,
            'description': 'Leading international project management role focusing on disaster relief.',
            'posted_by': ngos[0],
            'category': Job.Category.ADMINISTRATIVE
        },
        {
            'title': 'Public Health Specialist',
            'location': 'Pokhara',
            'salary_min': 90000,
            'salary_max': 150000,
            'employment_type': Job.EmploymentType.CONTRACT,
            'description': 'Technical role in public health programs across Western Nepal.',
            'posted_by': ngos[1],
            'category': Job.Category.PUBLIC_HEALTH
        },
        {
            'title': 'Finance Coordinator',
            'location': 'Butwal',
            'salary_min': 60000,
            'salary_max': 90000,
            'employment_type': Job.EmploymentType.FULL_TIME,
            'description': 'Ensuring financial transparency and accountability for child welfare projects.',
            'posted_by': ngos[2],
            'category': Job.Category.ADMINISTRATIVE
        }
    ]

    for data in jobs_data:
        Job.objects.get_or_create(
            title=data['title'],
            posted_by=data['posted_by'],
            defaults={
                'location': data['location'],
                'salary_min': data['salary_min'],
                'salary_max': data['salary_max'],
                'employment_type': data['employment_type'],
                'description': data['description'],
                'category': data['category'],
                'status': 'open'
            }
        )
    
    print("Seeding completed successfully!")

if __name__ == '__main__':
    seed()
