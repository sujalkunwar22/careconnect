from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver

from jobs.models import Application
from users.models import KYCDocument
from .models import Notification


@receiver(post_save, sender=Application)
def application_created_notification(sender, instance, created, **kwargs):
    """When a new application is created, notify the NGO."""
    if created:
        ngo_user = instance.job.posted_by
        Notification.objects.create(
            user=ngo_user,
            title="New Application",
            message=f"New application from {instance.applicant.full_name} for {instance.job.title}",
            notification_type=Notification.Type.APPLICATION_RECEIVED,
            metadata={
                "application_id": instance.id,
                "job_id": instance.job.id,
                "applicant_name": instance.applicant.full_name,
            },
        )


@receiver(pre_save, sender=Application)
def application_status_change_notification(sender, instance, **kwargs):
    """When application status changes, notify the applicant."""
    if not instance.pk:
        return  # New instance, handled by post_save

    try:
        old_instance = Application.objects.get(pk=instance.pk)
    except Application.DoesNotExist:
        return

    if old_instance.status == instance.status:
        return  # No status change

    applicant = instance.applicant
    job_title = instance.job.title

    if instance.status == Application.Status.INTERVIEW:
        interview = instance.interview_details or {}
        date_str = interview.get("date", "TBD")
        Notification.objects.create(
            user=applicant,
            title="🎉 Interview Scheduled",
            message=f"Interview scheduled for {job_title} on {date_str}",
            notification_type=Notification.Type.INTERVIEW_SCHEDULED,
            metadata={
                "application_id": instance.id,
                "job_id": instance.job.id,
                "interview_details": interview,
            },
        )

    elif instance.status == Application.Status.REJECTED:
        Notification.objects.create(
            user=applicant,
            title="Application Update",
            message=f"Application update for {job_title}: {instance.rejection_reason or 'Not selected'}",
            notification_type=Notification.Type.APPLICATION_REJECTED,
            metadata={
                "application_id": instance.id,
                "job_id": instance.job.id,
                "rejection_category": instance.rejection_category,
                "rejection_reason": instance.rejection_reason,
            },
        )

    elif instance.status == Application.Status.HIRED:
        Notification.objects.create(
            user=applicant,
            title="🎊 Congratulations!",
            message=f"You have been selected for {job_title}!",
            notification_type=Notification.Type.APPLICATION_HIRED,
            metadata={
                "application_id": instance.id,
                "job_id": instance.job.id,
            },
        )


@receiver(pre_save, sender=KYCDocument)
def kyc_status_change_notification(sender, instance, **kwargs):
    """When KYC status changes, notify the user."""
    if not instance.pk:
        return

    try:
        old_instance = KYCDocument.objects.get(pk=instance.pk)
    except KYCDocument.DoesNotExist:
        return

    if old_instance.status == instance.status:
        return

    user = instance.user

    if instance.status == KYCDocument.Status.VERIFIED:
        Notification.objects.create(
            user=user,
            title="✅ Identity Verified!",
            message="Your identity has been verified. You can now apply to jobs.",
            notification_type=Notification.Type.KYC_APPROVED,
            metadata={"kyc_id": instance.id},
        )

    elif instance.status == KYCDocument.Status.REJECTED:
        Notification.objects.create(
            user=user,
            title="KYC Verification Failed",
            message=f"Your KYC was rejected: {instance.rejection_reason}. Please resubmit.",
            notification_type=Notification.Type.KYC_REJECTED,
            metadata={
                "kyc_id": instance.id,
                "rejection_reason": instance.rejection_reason,
            },
        )

    elif instance.status == KYCDocument.Status.INFO_REQUESTED:
        Notification.objects.create(
            user=user,
            title="Additional Info Needed",
            message=f"Additional info needed for KYC: {instance.admin_notes}",
            notification_type=Notification.Type.KYC_INFO_REQUESTED,
            metadata={
                "kyc_id": instance.id,
                "admin_notes": instance.admin_notes,
            },
        )
