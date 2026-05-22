import os
import uuid
import logging
from django.db.models.signals import pre_save
from django.dispatch import receiver
from .models import Ticket
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
            ext = os.path.splitext(filename)[1] or '.jpg'
            unique_name = f"{uuid.uuid4().hex}{ext}"

            logger.info(f"Uploading new support ticket attachment {filename} for Ticket (Field: {field_name}) to bucket '{bucket}' as '{unique_name}'...")
            
            # Reset file pointer just in case
            if hasattr(field.file, 'seek'):
                field.file.seek(0)

            public_url = upload_to_supabase(field.file, bucket, unique_name)
            if public_url:
                logger.info(f"Upload success! Setting {field_name} of Ticket to: {public_url}")
                setattr(instance, field_name, public_url)
            else:
                logger.error(f"Failed to upload ticket attachment {filename} to Supabase. Keeping default.")
    except Exception as e:
        logger.error(f"Error processing ticket attachment upload: {e}")


@receiver(pre_save, sender=Ticket)
def ticket_pre_save(sender, instance, **kwargs):
    """
    Before saving a support Ticket, upload the attachment to Supabase.
    """
    using = kwargs.get('using', 'default')
    from core.signals import _signals_muted
    if _signals_muted or using != 'default':
        return
    process_file_upload(instance, 'attachment', 'tickets')
