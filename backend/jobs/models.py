from django.db import models
from django.conf import settings


class Job(models.Model):
    class EmploymentType(models.TextChoices):
        FULL_TIME = "full_time", "Full-time"
        PART_TIME = "part_time", "Part-time"
        CONTRACT = "contract", "Contract"
        VOLUNTEER = "volunteer", "Volunteer"

    class Category(models.TextChoices):
        NURSING = "nursing", "Nursing"
        PUBLIC_HEALTH = "public_health", "Public Health"
        COMMUNITY_HEALTH = "community_health", "Community Health"
        MENTAL_HEALTH = "mental_health", "Mental Health"
        CLINICAL = "clinical", "Clinical"
        ADMINISTRATIVE = "administrative", "Administrative"
        RESEARCH = "research", "Research"
        ELDERLY = "Elderly", "Elderly"
        CHILDCARE = "Childcare", "Childcare"
        DISABILITY = "Disability", "Disability"
        HOUSEHOLD = "Household", "Household"
        OTHER = "other", "Other"

    class Status(models.TextChoices):
        OPEN = "open", "Open"
        CLOSED = "closed", "Closed"
        DRAFT = "draft", "Draft"
        ACTIVE = "Active", "Active"

    posted_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, related_name="posted_jobs", on_delete=models.CASCADE, db_index=True
    )
    title = models.CharField(max_length=255, db_index=True)
    description = models.TextField()
    category = models.CharField(max_length=50, choices=Category.choices, default=Category.OTHER, db_index=True)
    location = models.CharField(max_length=255, db_index=True)
    employment_type = models.CharField(
        max_length=20, choices=EmploymentType.choices, default=EmploymentType.FULL_TIME, db_index=True
    )
    remote = models.BooleanField(default=False, db_index=True)
    salary_min = models.PositiveIntegerField(null=True, blank=True)
    salary_max = models.PositiveIntegerField(null=True, blank=True)
    requirements = models.JSONField(default=list, blank=True)
    skills_required = models.JSONField(default=list, blank=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.OPEN, db_index=True)
    views_count = models.PositiveIntegerField(default=0)
    deadline = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.title} ({self.get_status_display()})"


class Application(models.Model):
    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        SHORTLISTED = "shortlisted", "Shortlisted"
        INTERVIEW = "interview", "Interview Scheduled"
        REJECTED = "rejected", "Rejected"
        HIRED = "hired", "Hired"

    class RejectionCategory(models.TextChoices):
        UNDERQUALIFIED = "underqualified", "Underqualified"
        POSITION_FILLED = "position_filled", "Position Filled"
        LOCATION_MISMATCH = "location_mismatch", "Location Mismatch"
        APPLICATION_INCOMPLETE = "application_incomplete", "Application Incomplete"
        OTHER = "other", "Other"

    job = models.ForeignKey(Job, related_name="applications", on_delete=models.CASCADE, db_index=True)
    applicant = models.ForeignKey(
        settings.AUTH_USER_MODEL, related_name="applications", on_delete=models.CASCADE, db_index=True
    )
    cover_letter = models.TextField(blank=True)
    application_type = models.CharField(
        max_length=20,
        choices=[("portfolio", "Portfolio"), ("cv", "CV")],
        default="portfolio",
        db_index=True,
    )
    cv_file = models.FileField(upload_to="cvs/", null=True, blank=True, max_length=500)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING, db_index=True)
    interview_details = models.JSONField(default=dict, blank=True)
    rejection_reason = models.TextField(blank=True)
    rejection_category = models.CharField(
        max_length=30, choices=RejectionCategory.choices, blank=True
    )
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        unique_together = ["job", "applicant"]

    def __str__(self):
        return f"{self.applicant} -> {self.job.title} ({self.get_status_display()})"
