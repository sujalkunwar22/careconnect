import logging
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from core.supabase import sync_user_to_supabase

logger = logging.getLogger(__name__)
User = get_user_model()

class Command(BaseCommand):
    help = "Syncs all existing local SQLite users to the remote Supabase database."

    def handle(self, *args, **options):
        users = User.objects.all()
        count = users.count()
        self.stdout.write(self.style.WARNING(f"Found {count} local users. Starting synchronization to Supabase..."))

        success_count = 0
        for user in users:
            self.stdout.write(f"Syncing user: {user.username} (ID: {user.id})...")
            success = sync_user_to_supabase(user)
            if success:
                success_count += 1
                self.stdout.write(self.style.SUCCESS(f"Successfully synced user {user.username}"))
            else:
                self.stdout.write(self.style.ERROR(f"Failed to sync user {user.username}"))

        self.stdout.write(self.style.SUCCESS(f"Synchronization complete! {success_count}/{count} users successfully mirrored."))
