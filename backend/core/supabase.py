import os
import json
import urllib.request
import urllib.error
import mimetypes
import logging
from django.conf import settings

logger = logging.getLogger(__name__)

def upload_to_supabase(file_data, bucket, remote_filename, content_type=None):
    """
    Uploads binary file data to Supabase Storage and returns the public URL.
    file_data: bytes or file-like object
    bucket: 'profiles', 'kyc', or 'cvs'
    remote_filename: string path/name of file in the bucket
    """
    supabase_url = getattr(settings, 'SUPABASE_URL', '').rstrip('/')
    supabase_key = getattr(settings, 'SUPABASE_ANON_KEY', '')

    if not supabase_url or not supabase_key:
        logger.error("Supabase settings not configured properly.")
        return None

    # Clean filename (replace spaces or special characters to avoid URL escaping issues)
    remote_filename = urllib.parse.quote(remote_filename.replace(' ', '_'))
    
    # Supabase Storage Endpoint for uploads: POST /storage/v1/object/{bucket}/{path}
    url = f"{supabase_url}/storage/v1/object/{bucket}/{remote_filename}"
    
    if not content_type:
        content_type, _ = mimetypes.guess_type(remote_filename)
        if not content_type:
            content_type = 'application/octet-stream'

    headers = {
        "apikey": supabase_key,
        "Authorization": f"Bearer {supabase_key}",
        "Content-Type": content_type
    }

    # If file_data is not bytes, try to read it
    if hasattr(file_data, 'read'):
        binary_data = file_data.read()
    else:
        binary_data = file_data

    # Try POST first. If it fails with conflict (409/400), try PUT to overwrite/update.
    try:
        req = urllib.request.Request(url, data=binary_data, headers=headers, method='POST')
        with urllib.request.urlopen(req) as response:
            res_body = response.read().decode('utf-8')
            logger.info(f"Successfully uploaded {remote_filename} to bucket {bucket} via POST.")
    except urllib.error.HTTPError as e:
        res_code = e.code
        res_err = e.read().decode('utf-8')
        logger.warning(f"POST upload failed with code {res_code}: {res_err}. Retrying with PUT...")
        
        # Overwrite with PUT
        try:
            req = urllib.request.Request(url, data=binary_data, headers=headers, method='PUT')
            with urllib.request.urlopen(req) as response:
                res_body = response.read().decode('utf-8')
                logger.info(f"Successfully uploaded/overwritten {remote_filename} to bucket {bucket} via PUT.")
        except Exception as put_e:
            logger.error(f"Failed to upload {remote_filename} to Supabase bucket {bucket} via PUT: {put_e}")
            return None
    except Exception as e:
        logger.error(f"Failed to upload {remote_filename} to Supabase bucket {bucket}: {e}")
        return None

    # Public URL structure: {supabase_url}/storage/v1/object/public/{bucket}/{remote_filename}
    public_url = f"{supabase_url}/storage/v1/object/public/{bucket}/{remote_filename}"
    logger.info(f"Public URL generated: {public_url}")
    return public_url


def sync_user_to_supabase(user):
    """
    Syncs user details to remote Supabase 'users' table using Postgrest UPSERT API.
    """
    supabase_url = getattr(settings, 'SUPABASE_URL', '').rstrip('/')
    supabase_key = getattr(settings, 'SUPABASE_ANON_KEY', '')

    if not supabase_url or not supabase_key:
        logger.error("Supabase settings not configured properly for user sync.")
        return False

    url = f"{supabase_url}/rest/v1/users?on_conflict=id"

    # Safely extract skills
    skills_data = []
    if hasattr(user, 'skills') and user.skills:
        if isinstance(user.skills, str):
            try:
                skills_data = json.loads(user.skills)
            except json.JSONDecodeError:
                skills_data = [s.strip() for s in user.skills.split(',') if s.strip()]
        elif isinstance(user.skills, (list, dict)):
            skills_data = user.skills

    # Build payload
    payload = {
        "id": user.id,
        "username": user.username,
        "email": user.email or "",
        "phone_number": getattr(user, 'phone_number', '') or "",
        "role": getattr(user, 'role', '') or "seeker",
        "full_name": getattr(user, 'full_name', '') or "",
        "bio": getattr(user, 'bio', '') or "",
        "professional_title": getattr(user, 'professional_title', '') or "",
        "skills": skills_data,
        "address": getattr(user, 'address', '') or "",
        "municipality": getattr(user, 'municipality', '') or "",
        "ward": getattr(user, 'ward', '') or "",
        "profile_image": user.profile_image.url if (hasattr(user, 'profile_image') and user.profile_image) else "",
        "is_kyc_verified": getattr(user, 'is_kyc_verified', False)
    }

    # If profile_image is a Django ImageField, it might have a full URL (if we save Supabase URL directly)
    # Let's make sure it handles both relative and absolute paths
    if payload["profile_image"] and not payload["profile_image"].startswith('http'):
        # If it's a relative path, we shouldn't sync it as local relative path, or we format it.
        # But our signal interceptor will make sure profile_image holds the absolute Supabase URL, so this works perfectly!
        pass

    headers = {
        "apikey": supabase_key,
        "Authorization": f"Bearer {supabase_key}",
        "Content-Type": "application/json",
        "Prefer": "resolution=merge-duplicates"  # UPSERT header
    }

    data = json.dumps([payload]).encode('utf-8')

    try:
        req = urllib.request.Request(url, data=data, headers=headers, method='POST')
        with urllib.request.urlopen(req) as response:
            res_code = response.getcode()
            logger.info(f"Successfully synced user {user.username} (ID: {user.id}) to Supabase with response code {res_code}.")
            return True
    except urllib.error.HTTPError as e:
        res_err = e.read().decode('utf-8')
        logger.error(f"Failed to sync user {user.username} to Supabase: {e.code} - {res_err}")
        return False
    except Exception as e:
        logger.error(f"Failed to sync user {user.username} to Supabase: {e}")
        return False
