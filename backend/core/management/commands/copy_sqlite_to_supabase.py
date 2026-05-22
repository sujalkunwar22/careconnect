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
    help = "Copies all existing data from SQLite backup database to remote Supabase PostgreSQL database."

    def handle(self, *args, **options):
        self.stdout.write(self.style.WARNING("Starting database copy from SQLite to Supabase..."))

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
            # 1. Clear existing data on Supabase database to avoid conflicts
            self.stdout.write("Clearing existing records on Supabase to ensure clean sync...")
            # We clear them in reverse order to respect foreign key constraints
            for model_class, name in reversed(models_to_copy):
                count = model_class.objects.using('default').count()
                if count > 0:
                    self.stdout.write(f"  Clearing {count} records from {name} on Supabase...")
                    model_class.objects.using('default').all().delete()

            # 2. Copy records from SQLite to Supabase
            for model_class, name in models_to_copy:
                records = model_class.objects.using('sqlite_backup').all()
                count = records.count()
                self.stdout.write(f"Copying {count} records for {name}...")
                
                success_count = 0
                for record in records:
                    try:
                        # Save the record to the default database (Supabase)
                        # We use save(using='default') which inserts it with the same pk
                        record.save(using='default')
                        success_count += 1
                    except Exception as err:
                        self.stdout.write(self.style.ERROR(f"  Failed to copy {name} (ID: {record.pk}): {err}"))
                
                self.stdout.write(self.style.SUCCESS(f"  Successfully copied {success_count}/{count} records for {name}."))

                # 3. Reset PostgreSQL primary key sequence for auto-increment keys
                self.reset_postgres_sequence(model_class)

            self.stdout.write(self.style.SUCCESS("Database synchronization from SQLite to Supabase completed successfully!"))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"Critical error during database copy: {e}"))
        finally:
            # Unmute signals
            core.signals._signals_muted = False
            self.stdout.write("Unmuted database backup mirroring signals.")

    def reset_postgres_sequence(self, model_class):
        """
        Resets PostgreSQL primary key serial sequence to match the max ID.
        This prevents duplicate key errors on subsequent inserts.
        """
        db_conn = connections['default']
        if db_conn.vendor == 'postgresql':
            table_name = model_class._meta.db_table
            pk_name = model_class._meta.pk.name
            sequence_name = f"{table_name}_{pk_name}_seq"
            
            with db_conn.cursor() as cursor:
                try:
                    # Dynamically get the sequence name and reset it to max ID
                    cursor.execute(f"SELECT setval(pg_get_serial_sequence('{table_name}', '{pk_name}'), COALESCE(MAX({pk_name}), 1)) FROM {table_name}")
                except Exception:
                    # Fallback if standard sequence naming is used directly
                    try:
                        cursor.execute(f"SELECT setval('{sequence_name}', COALESCE(MAX({pk_name}), 1)) FROM {table_name}")
                    except Exception:
                        pass
