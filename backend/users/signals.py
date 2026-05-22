import os
import uuid
import logging
from django.db.models.signals import pre_save, post_save
from django.dispatch import receiver
from .models import User, NGOProfile, KYCDocument
from core.supabase import upload_to_supabase, sync_user_to_supabase

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
        # If it's a URL in the database, the string representation starts with http
        field_str = str(field)
        if field_str.startswith('http'):
            return

        # If it's not empty and has a name (and isn't just a string path pointing to a nonexistent file)
        if hasattr(field, 'file') and field.name:
            filename = os.path.basename(field.name)
            # Prefix with a UUID to prevent naming collisions and caching issues
            ext = os.path.splitext(filename)[1] or '.bin'
            unique_name = f"{uuid.uuid4().hex}{ext}"

            logger.info(f"Uploading new file {filename} for {instance.__class__.__name__} (Field: {field_name}) to bucket '{bucket}' as '{unique_name}'...")
            
            # Reset file pointer just in case
            if hasattr(field.file, 'seek'):
                field.file.seek(0)

            public_url = upload_to_supabase(field.file, bucket, unique_name)
            if public_url:
                logger.info(f"Upload success! Setting {field_name} of {instance.__class__.__name__} to: {public_url}")
                setattr(instance, field_name, public_url)
            else:
                logger.error(f"Failed to upload {filename} to Supabase. Keeping default.")
    except Exception as e:
        logger.error(f"Error processing file upload for {instance.__class__.__name__} (Field: {field_name}): {e}")


@receiver(pre_save, sender=User)
def user_pre_save(sender, instance, **kwargs):
    """
    Before saving a User, check if a profile image is being uploaded.
    """
    using = kwargs.get('using', 'default')
    from core.signals import _signals_muted
    if _signals_muted or using != 'default':
        return
    process_file_upload(instance, 'profile_image', 'profiles')


@receiver(post_save, sender=User)
def user_post_save(sender, instance, created, **kwargs):
    """
    After saving a User, sync their data to the remote Supabase 'users' table.
    """
    using = kwargs.get('using', 'default')
    from core.signals import _signals_muted
    if _signals_muted or using != 'default':
        return
    logger.info(f"Syncing user {instance.username} to Supabase after save signal...")
    sync_user_to_supabase(instance)


@receiver(pre_save, sender=NGOProfile)
def ngo_profile_pre_save(sender, instance, **kwargs):
    """
    Before saving an NGOProfile, upload the logo to Supabase.
    """
    using = kwargs.get('using', 'default')
    from core.signals import _signals_muted
    if _signals_muted or using != 'default':
        return
    process_file_upload(instance, 'logo', 'profiles')


@receiver(pre_save, sender=KYCDocument)
def kyc_document_pre_save(sender, instance, **kwargs):
    """
    Before saving a KYCDocument, upload front, back, and selfie images to Supabase.
    """
    using = kwargs.get('using', 'default')
    from core.signals import _signals_muted
    if _signals_muted or using != 'default':
        return
    process_file_upload(instance, 'front_image', 'kyc')
    process_file_upload(instance, 'back_image', 'kyc')
    process_file_upload(instance, 'selfie_image', 'kyc')
