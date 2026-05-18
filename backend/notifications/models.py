from django.db import models
from django.conf import settings


class Notification(models.Model):
    class Type(models.TextChoices):
        APPLICATION_RECEIVED = "application_received", "Application Received"
        INTERVIEW_SCHEDULED = "interview_scheduled", "Interview Scheduled"
        APPLICATION_REJECTED = "application_rejected", "Application Rejected"
        APPLICATION_HIRED = "application_hired", "Application Hired"
        KYC_APPROVED = "kyc_approved", "KYC Approved"
        KYC_REJECTED = "kyc_rejected", "KYC Rejected"
        KYC_INFO_REQUESTED = "kyc_info_requested", "KYC Info Requested"
        JOB_MATCH = "job_match", "Job Match"
        SYSTEM = "system", "System"

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, related_name="notifications", on_delete=models.CASCADE
    )
    title = models.CharField(max_length=255)
    message = models.TextField()
    notification_type = models.CharField(
        max_length=30, choices=Type.choices, default=Type.SYSTEM
    )
    metadata = models.JSONField(default=dict, blank=True)
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.title} -> {self.user}"
