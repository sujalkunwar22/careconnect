import random
from datetime import date, timedelta
from django.core.management.base import BaseCommand
from django.utils import timezone

from users.models import User, NGOProfile, KYCDocument
from jobs.models import Job, Application
from portfolio.models import Experience, Education, Certification
from notifications.models import Notification


class Command(BaseCommand):
    help = "Seed database with sample data for development"

    def handle(self, *args, **options):
        self.stdout.write("Seeding database...")

        # Clear existing data
        Notification.objects.all().delete()
        Application.objects.all().delete()
        Job.objects.all().delete()
        Certification.objects.all().delete()
        Education.objects.all().delete()
        Experience.objects.all().delete()
        KYCDocument.objects.all().delete()
        NGOProfile.objects.all().delete()
        User.objects.all().delete()

        # ─── ADMIN ────────────────────────────────────
        admin = User.objects.create_user(
            username="admin@careconnect.np",
            email="admin@careconnect.np",
            password="Admin@123",
            role=User.Roles.ADMIN,
            full_name="System Admin",
            is_staff=True,
            is_superuser=True,
        )
        self.stdout.write(self.style.SUCCESS(f"  Admin: {admin.email} / Admin@123"))

        # ─── NGOs ─────────────────────────────────────
        ngos_data = [
            {
                "email": "info@maiti.org.np",
                "full_name": "Maiti Nepal",
                "org": "Maiti Nepal",
                "sector": "Women Empowerment",
                "desc": "Leading organization combating trafficking and empowering women in Nepal.",
                "reg": "NGO-2024-001",
                "verified": True,
            },
            {
                "email": "contact@redcross.org.np",
                "full_name": "Nepal Red Cross Society",
                "org": "Nepal Red Cross Society",
                "sector": "Healthcare",
                "desc": "Humanitarian aid and disaster response across Nepal.",
                "reg": "NGO-2024-002",
                "verified": True,
            },
            {
                "email": "admin@roomtoread.org.np",
                "full_name": "Room to Read Nepal",
                "org": "Room to Read Nepal",
                "sector": "Education",
                "desc": "Promoting literacy and gender equality through education programs.",
                "reg": "NGO-2024-003",
                "verified": False,
            },
        ]

        ngo_users = []
        for data in ngos_data:
            u = User.objects.create_user(
                username=data["email"],
                email=data["email"],
                password="Ngo@12345",
                role=User.Roles.NGO,
                full_name=data["full_name"],
            )
            NGOProfile.objects.create(
                user=u,
                organization_name=data["org"],
                sector=data["sector"],
                description=data["desc"],
                registration_number=data["reg"],
                is_verified=data["verified"],
            )
            ngo_users.append(u)
            self.stdout.write(f"  NGO: {data['email']} / Ngo@12345")

        # ─── PROFESSIONALS ─────────────────────────────
        pros_data = [
            {
                "email": "sita.tamang@gmail.com",
                "full_name": "Sita Tamang",
                "title": "Registered Nurse",
                "bio": "Experienced registered nurse with 5 years in community health programs.",
                "skills": ["Nursing", "First Aid", "Community Health", "Patient Care"],
                "kyc": "verified",
            },
            {
                "email": "ram.shrestha@gmail.com",
                "full_name": "Ram Shrestha",
                "title": "Public Health Specialist",
                "bio": "MPH graduate specialized in epidemiology and public health research.",
                "skills": ["Epidemiology", "Research", "Data Analysis", "Health Policy"],
                "kyc": "verified",
            },
            {
                "email": "maya.gurung@gmail.com",
                "full_name": "Maya Gurung",
                "title": "Social Worker",
                "bio": "Passionate about child welfare and community development.",
                "skills": ["Social Work", "Counseling", "Child Protection", "Community Development"],
                "kyc": "pending",
            },
            {
                "email": "bikash.kc@gmail.com",
                "full_name": "Bikash KC",
                "title": "Mental Health Counselor",
                "bio": "Licensed counselor focusing on trauma-informed care.",
                "skills": ["Counseling", "Mental Health", "Trauma Care", "CBT"],
                "kyc": "pending",
            },
            {
                "email": "anita.rai@gmail.com",
                "full_name": "Anita Rai",
                "title": "Healthcare Administrator",
                "bio": "Healthcare management professional seeking NGO opportunities.",
                "skills": ["Administration", "Healthcare Management", "Project Management"],
                "kyc": "none",
            },
        ]

        pro_users = []
        for data in pros_data:
            u = User.objects.create_user(
                username=data["email"],
                email=data["email"],
                password="User@12345",
                role=User.Roles.USER,
                full_name=data["full_name"],
                professional_title=data["title"],
                bio=data["bio"],
                skills=data["skills"],
                is_kyc_verified=(data["kyc"] == "verified"),
                address="Kathmandu",
                municipality="Kathmandu Metropolitan City",
            )
            pro_users.append(u)
            self.stdout.write(f"  Professional: {data['email']} / User@12345 (KYC: {data['kyc']})")

            # Create KYC documents for pending users
            if data["kyc"] == "pending":
                KYCDocument.objects.create(
                    user=u,
                    document_type=KYCDocument.DocType.CITIZENSHIP,
                    front_image="kyc/sample_front.jpg",
                    selfie_image="kyc/sample_selfie.jpg",
                    status=KYCDocument.Status.PENDING,
                )

            # Add portfolio for verified users
            if data["kyc"] == "verified":
                Experience.objects.create(
                    user=u,
                    job_title=data["title"],
                    organization="Previous Organization",
                    start_date=date(2020, 1, 1),
                    end_date=date(2023, 12, 31),
                    description=f"Worked as {data['title']} for 4 years.",
                    skills_used=data["skills"][:2],
                )
                Education.objects.create(
                    user=u,
                    degree="Bachelor's in Health Sciences",
                    institution="Tribhuvan University",
                    field_of_study="Health Sciences",
                    start_year=2016,
                    end_year=2020,
                )
                Certification.objects.create(
                    user=u,
                    name="Basic Life Support Certification",
                    issuing_organization="Nepal Red Cross",
                    issue_date=date(2023, 6, 15),
                )

        # ─── JOBS ──────────────────────────────────────
        jobs_data = [
            {
                "ngo": 0, "title": "Community Health Worker",
                "cat": Job.Category.COMMUNITY_HEALTH,
                "type": Job.EmploymentType.FULL_TIME,
                "loc": "Kathmandu", "remote": False,
                "sal_min": 25000, "sal_max": 35000,
                "desc": "Join our team as a community health worker to provide primary healthcare services in underserved communities.",
                "reqs": ["Minimum 2 years experience in community health", "Ability to travel to remote areas", "Fluent in Nepali and local dialect"],
                "skills": ["Community Health", "First Aid", "Communication", "Nepali"],
                "deadline": 30,
            },
            {
                "ngo": 0, "title": "Women Empowerment Program Coordinator",
                "cat": Job.Category.COMMUNITY_HEALTH,
                "type": Job.EmploymentType.FULL_TIME,
                "loc": "Lalitpur", "remote": False,
                "sal_min": 40000, "sal_max": 55000,
                "desc": "Lead and coordinate women empowerment programs across rural Nepal.",
                "reqs": ["5+ years in social development", "Gender studies background", "Strong leadership skills"],
                "skills": ["Program Management", "Gender Studies", "Leadership", "Report Writing"],
                "deadline": 21,
            },
            {
                "ngo": 1, "title": "Emergency Response Nurse",
                "cat": Job.Category.NURSING,
                "type": Job.EmploymentType.CONTRACT,
                "loc": "Various Locations", "remote": False,
                "sal_min": 30000, "sal_max": 45000,
                "desc": "Provide emergency nursing care during disaster response operations.",
                "reqs": ["Registered Nurse license", "Emergency care experience", "Willingness to deploy on short notice"],
                "skills": ["Emergency Nursing", "Triage", "First Aid", "Disaster Response"],
                "deadline": 14,
            },
            {
                "ngo": 1, "title": "Public Health Researcher",
                "cat": Job.Category.RESEARCH,
                "type": Job.EmploymentType.PART_TIME,
                "loc": "Kathmandu", "remote": True,
                "sal_min": 20000, "sal_max": 30000,
                "desc": "Conduct health research and contribute to peer-reviewed publications.",
                "reqs": ["MPH or equivalent", "Research methodology experience", "Published research papers"],
                "skills": ["Research", "Data Analysis", "SPSS", "Academic Writing"],
                "deadline": 45,
            },
            {
                "ngo": 2, "title": "Education Program Officer",
                "cat": Job.Category.ADMINISTRATIVE,
                "type": Job.EmploymentType.FULL_TIME,
                "loc": "Bharatpur", "remote": False,
                "sal_min": 35000, "sal_max": 45000,
                "desc": "Oversee literacy programs and teacher training initiatives.",
                "reqs": ["Education degree", "3+ years in education sector", "Program monitoring experience"],
                "skills": ["Education", "Monitoring & Evaluation", "Training", "Report Writing"],
                "deadline": 60,
            },
            {
                "ngo": 2, "title": "Mental Health Counselor (Volunteer)",
                "cat": Job.Category.MENTAL_HEALTH,
                "type": Job.EmploymentType.VOLUNTEER,
                "loc": "Remote", "remote": True,
                "sal_min": None, "sal_max": None,
                "desc": "Provide volunteer mental health counseling to students in need.",
                "reqs": ["Psychology degree", "Counseling experience", "Empathetic personality"],
                "skills": ["Counseling", "Psychology", "Active Listening", "Crisis Intervention"],
                "deadline": 90,
            },
        ]

        jobs = []
        for data in jobs_data:
            j = Job.objects.create(
                posted_by=ngo_users[data["ngo"]],
                title=data["title"],
                category=data["cat"],
                employment_type=data["type"],
                location=data["loc"],
                remote=data["remote"],
                salary_min=data["sal_min"],
                salary_max=data["sal_max"],
                description=data["desc"],
                requirements=data["reqs"],
                skills_required=data["skills"],
                deadline=date.today() + timedelta(days=data["deadline"]),
                status=Job.Status.OPEN,
            )
            jobs.append(j)
            self.stdout.write(f"  Job: {j.title}")

        # ─── APPLICATIONS ──────────────────────────────
        applications_data = [
            {"pro": 0, "job": 0, "status": Application.Status.INTERVIEW,
             "interview": {"date": "2026-05-15", "time": "10:00 AM", "platform": "Google Meet", "location_or_link": "https://meet.google.com/abc-defg-hij", "message": "Looking forward to meeting you!"}},
            {"pro": 0, "job": 2, "status": Application.Status.PENDING, "interview": {}},
            {"pro": 1, "job": 3, "status": Application.Status.HIRED, "interview": {}},
            {"pro": 1, "job": 0, "status": Application.Status.REJECTED,
             "rejection_category": "position_filled", "rejection_reason": "Position has been filled."},
            {"pro": 2, "job": 0, "status": Application.Status.PENDING, "interview": {}},
            {"pro": 2, "job": 4, "status": Application.Status.PENDING, "interview": {}},
            {"pro": 3, "job": 5, "status": Application.Status.INTERVIEW,
             "interview": {"date": "2026-05-20", "time": "2:00 PM", "platform": "Zoom", "location_or_link": "https://zoom.us/j/123456", "message": "Please be ready 5 minutes early."}},
            {"pro": 4, "job": 1, "status": Application.Status.PENDING, "interview": {}},
        ]

        for data in applications_data:
            app = Application(
                job=jobs[data["job"]],
                applicant=pro_users[data["pro"]],
                cover_letter=f"I am excited to apply for this position. My experience in {', '.join(pro_users[data['pro']].skills[:2])} makes me a strong candidate.",
                status=data["status"],
                interview_details=data.get("interview", {}),
                rejection_reason=data.get("rejection_reason", ""),
                rejection_category=data.get("rejection_category", ""),
            )
            app.save()
            self.stdout.write(f"  Application: {app.applicant.full_name} -> {app.job.title} ({app.status})")

        # ─── NOTIFICATIONS ─────────────────────────────
        sample_notifications = [
            (pro_users[0], "🎉 Interview Scheduled", "Interview for Community Health Worker on May 15, 2026", Notification.Type.INTERVIEW_SCHEDULED),
            (pro_users[1], "🎊 Congratulations!", "You have been selected for Public Health Researcher!", Notification.Type.APPLICATION_HIRED),
            (pro_users[1], "Application Update", "Your application for Community Health Worker was not selected.", Notification.Type.APPLICATION_REJECTED),
            (pro_users[0], "✅ Identity Verified!", "Your identity has been verified. You can now apply to jobs.", Notification.Type.KYC_APPROVED),
            (pro_users[2], "New Job Match", "A new Community Health Worker position matches your skills!", Notification.Type.JOB_MATCH),
            (ngo_users[0], "New Application", "New application from Sita Tamang for Community Health Worker", Notification.Type.APPLICATION_RECEIVED),
            (ngo_users[0], "New Application", "New application from Maya Gurung for Community Health Worker", Notification.Type.APPLICATION_RECEIVED),
            (ngo_users[1], "New Application", "New application from Ram Shrestha for Public Health Researcher", Notification.Type.APPLICATION_RECEIVED),
            (admin, "System Alert", "3 new KYC applications pending review.", Notification.Type.SYSTEM),
        ]

        for user, title, message, ntype in sample_notifications:
            Notification.objects.create(
                user=user, title=title, message=message,
                notification_type=ntype,
            )

        self.stdout.write(self.style.SUCCESS("\nDatabase seeded successfully!"))
        self.stdout.write(self.style.WARNING("\nLogin credentials:"))
        self.stdout.write(f"  Admin:        admin@careconnect.np / Admin@123")
        self.stdout.write(f"  NGOs:         (any ngo email) / Ngo@12345")
        self.stdout.write(f"  Professionals: (any user email) / User@12345")
