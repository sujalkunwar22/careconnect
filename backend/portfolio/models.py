from django.db import models
from django.conf import settings


class Experience(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, related_name="experiences", on_delete=models.CASCADE
    )
    job_title = models.CharField(max_length=255)
    organization = models.CharField(max_length=255)
    start_date = models.DateField()
    end_date = models.DateField(null=True, blank=True)
    is_current = models.BooleanField(default=False)
    description = models.TextField(blank=True)
    skills_used = models.JSONField(default=list, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-start_date"]

    def __str__(self):
        return f"{self.job_title} at {self.organization}"


class Education(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, related_name="education", on_delete=models.CASCADE
    )
    degree = models.CharField(max_length=255)
    institution = models.CharField(max_length=255)
    field_of_study = models.CharField(max_length=255, blank=True)
    start_year = models.PositiveIntegerField()
    end_year = models.PositiveIntegerField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-start_year"]

    def __str__(self):
        return f"{self.degree} - {self.institution}"


class Certification(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, related_name="certifications", on_delete=models.CASCADE
    )
    name = models.CharField(max_length=255)
    issuing_organization = models.CharField(max_length=255)
    issue_date = models.DateField()
    credential_url = models.URLField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-issue_date"]

    def __str__(self):
        return f"{self.name} by {self.issuing_organization}"


class CareActivity(models.Model):
    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        VERIFIED = "verified", "Verified"
        REJECTED = "rejected", "Rejected"

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, related_name="care_activities", on_delete=models.CASCADE
    )
    title = models.CharField(max_length=255)
    category = models.CharField(max_length=50, blank=True)
    hours = models.DecimalField(max_digits=6, decimal_places=2)
    date = models.DateField()
    description = models.TextField(blank=True)
    location = models.CharField(max_length=255, blank=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    reviewed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        related_name="verified_care_activities",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
    )
    reviewed_at = models.DateTimeField(null=True, blank=True)
    rejection_reason = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-date", "-created_at"]

    def __str__(self):
        return f"{self.title} ({self.user})"
