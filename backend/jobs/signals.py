import os
import uuid
import logging
from django.db.models.signals import pre_save, post_save
from django.dispatch import receiver
from .models import Application, Job
from core.supabase import upload_to_supabase

logger = logging.getLogger(__name__)

def process_file_upload(instance, field_name, bucket):
    """
    Helper to check if a file field has a new file upload, upload it to Supabase, 
    and store the absolute URL string in the field.
    """
    try:
        field = getattr(instance, field_name, None)
        if not field:
            return

        # If it's a string starting with http, it is already a Supabase public URL
        if isinstance(field, str) and field.startswith('http'):
            return

        # If it's a FieldFile, check if it contains a newly uploaded file
        field_str = str(field)
        if field_str.startswith('http'):
            return

        # If it's not empty and has a name (and isn't just a string path pointing to a nonexistent file)
        if hasattr(field, 'file') and field.name:
            filename = os.path.basename(field.name)
            # Prefix with a UUID to prevent naming collisions and caching issues
            ext = os.path.splitext(filename)[1] or '.pdf'
            unique_name = f"{uuid.uuid4().hex}{ext}"

            logger.info(f"Uploading new CV file {filename} for Application (Field: {field_name}) to bucket '{bucket}' as '{unique_name}'...")
            
            # Reset file pointer just in case
            if hasattr(field.file, 'seek'):
                field.file.seek(0)

            public_url = upload_to_supabase(field.file, bucket, unique_name)
            if public_url:
                logger.info(f"Upload success! Setting {field_name} of Application to: {public_url}")
                setattr(instance, field_name, public_url)
            else:
                logger.error(f"Failed to upload CV file {filename} to Supabase. Keeping default.")
    except Exception as e:
        logger.error(f"Error processing CV file upload for Application: {e}")


@receiver(pre_save, sender=Application)
def application_pre_save(sender, instance, **kwargs):
    """
    Before saving a job Application, upload the cv_file to Supabase.
    """
    using = kwargs.get('using', 'default')
    from core.signals import _signals_muted
    if _signals_muted or using != 'default':
        return
    process_file_upload(instance, 'cv_file', 'cvs')


@receiver(post_save, sender=Application)
def close_job_on_hire(sender, instance, created, **kwargs):
    """
    After saving a job Application, if the candidate is marked as hired,
    close the corresponding job listing automatically.
    """
    using = kwargs.get('using', 'default')
    from core.signals import _signals_muted
    if _signals_muted or using != 'default':
        return
        
    if instance.status == Application.Status.HIRED:
        job = instance.job
        if job.status != Job.Status.CLOSED:
            job.status = Job.Status.CLOSED
            job.save(update_fields=["status"])
            logger.info(f"Job (ID: {job.id}, Title: {job.title}) closed automatically due to candidate hire (Application ID: {instance.id}).")
