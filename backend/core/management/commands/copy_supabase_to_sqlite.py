from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.db import connections
import core.signals

# Import models from our apps
from users.models import NGOProfile, KYCDocument, OTP
from portfolio.models import Experience, Education, Certification, CareActivity
from jobs.models import Job, Application
from notifications.models import Notification
from support.models import Ticket

User = get_user_model()

class Command(BaseCommand):
    help = "Copies all existing data from remote Supabase PostgreSQL database to local SQLite backup database."

    def handle(self, *args, **options):
        self.stdout.write(self.style.WARNING("Starting database copy from Supabase to SQLite backup..."))

        # Mute backup signals during data copying to avoid circular writes and redundancy
        core.signals._signals_muted = True
        self.stdout.write("Muted database backup mirroring signals.")

        # Order of models to copy (dependency-safe order)
        models_to_copy = [
            (User, "User"),
            (NGOProfile, "NGOProfile"),
            (KYCDocument, "KYCDocument"),
            (OTP, "OTP"),
            (Experience, "Experience"),
            (Education, "Education"),
            (Certification, "Certification"),
            (CareActivity, "CareActivity"),
            (Job, "Job"),
            (Application, "Application"),
            (Notification, "Notification"),
            (Ticket, "Ticket")
        ]

        try:
            # 1. Clear existing data on SQLite backup database to avoid conflicts
            self.stdout.write("Clearing existing records on SQLite backup to ensure clean sync...")
            # We clear them in reverse order to respect foreign key constraints
            for model_class, name in reversed(models_to_copy):
                count = model_class.objects.using('sqlite_backup').count()
                if count > 0:
                    self.stdout.write(f"  Clearing {count} records from {name} on SQLite backup...")
                    model_class.objects.using('sqlite_backup').all().delete()

            # 2. Copy records from Supabase to SQLite backup
            for model_class, name in models_to_copy:
                records = model_class.objects.using('default').all()
                count = records.count()
                self.stdout.write(f"Copying {count} records for {name}...")
                
                success_count = 0
                for record in records:
                    try:
                        # Save the record to the sqlite_backup database with the same pk
                        record.save(using='sqlite_backup')
                        success_count += 1
                    except Exception as err:
                        self.stdout.write(self.style.ERROR(f"  Failed to copy {name} (ID: {record.pk}): {err}"))
                
                self.stdout.write(self.style.SUCCESS(f"  Successfully copied {success_count}/{count} records for {name}."))

            self.stdout.write(self.style.SUCCESS("Database synchronization from Supabase to SQLite completed successfully!"))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"Critical error during database copy: {e}"))
        finally:
            # Unmute signals
            core.signals._signals_muted = False
            self.stdout.write("Unmuted database backup mirroring signals.")
