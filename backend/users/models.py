from __future__ import annotations

from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    class Roles(models.TextChoices):
        USER = "user", "Professional"
        NGO = "ngo", "NGO"
        ADMIN = "admin", "Admin"

    username = models.CharField(max_length=150, unique=True)
    email = models.EmailField(unique=True, null=True, blank=True)
    phone_number = models.CharField(max_length=20, unique=True, null=True, blank=True)
    role = models.CharField(max_length=20, choices=Roles.choices, default=Roles.USER)
    full_name = models.CharField(max_length=255, blank=True)
    bio = models.TextField(blank=True)
    professional_title = models.CharField(max_length=255, blank=True)
    skills = models.JSONField(default=list, blank=True)
    address = models.CharField(max_length=255, blank=True)
    municipality = models.CharField(max_length=255, blank=True)
    ward = models.CharField(max_length=50, blank=True)
    profile_image = models.ImageField(upload_to="profiles/", blank=True, null=True, max_length=500)
    is_kyc_verified = models.BooleanField(default=False)

    def delete(self, *args, **kwargs):
        if self.role == self.Roles.ADMIN:
            raise Exception("Admin users cannot be deleted.")
        return super().delete(*args, **kwargs)

    def __str__(self) -> str:
        return self.full_name or self.username or self.email or str(self.pk)


class NGOProfile(models.Model):
    user = models.OneToOneField(User, related_name="ngo_profile", on_delete=models.CASCADE)
    organization_name = models.CharField(max_length=255)
    registration_number = models.CharField(max_length=100, blank=True)
    sector = models.CharField(max_length=100, blank=True)
    description = models.TextField(blank=True)
    website = models.URLField(blank=True)
    logo = models.ImageField(upload_to="ngo_logos/", blank=True, null=True, max_length=500)
    is_verified = models.BooleanField(default=False)

    def __str__(self) -> str:
        return self.organization_name


class KYCDocument(models.Model):
    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        VERIFIED = "verified", "Verified"
        REJECTED = "rejected", "Rejected"
        INFO_REQUESTED = "info_requested", "Info Requested"

    class DocType(models.TextChoices):
        CITIZENSHIP = "citizenship", "Citizenship"
        PASSPORT = "passport", "Passport"
        DRIVERS_LICENSE = "drivers_license", "Driver's License"

    user = models.ForeignKey(User, related_name="kyc_documents", on_delete=models.CASCADE)
    document_type = models.CharField(max_length=50, choices=DocType.choices)
    front_image = models.ImageField(upload_to="kyc/front/", max_length=500)
    back_image = models.ImageField(upload_to="kyc/back/", blank=True, null=True, max_length=500)
    selfie_image = models.ImageField(upload_to="kyc/selfie/", max_length=500)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    rejection_reason = models.TextField(blank=True)
    admin_notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    reviewed_at = models.DateTimeField(null=True, blank=True)
    reviewed_by = models.ForeignKey(
        User, null=True, blank=True, on_delete=models.SET_NULL, related_name="kyc_reviews"
    )

    class Meta:
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return f"{self.user} - {self.document_type} ({self.status})"


class OTP(models.Model):
    phone_number = models.CharField(max_length=20)
    code = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)
    is_used = models.BooleanField(default=False)

    class Meta:
        indexes = [
            models.Index(fields=["phone_number", "code"]),
        ]
