import logging
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver

logger = logging.getLogger(__name__)

# Module-level flag to temporarily disable backup mirroring (e.g. during initial data copy)
_signals_muted = False

# List of apps/model names to mirror.
# We want to mirror all custom models and auth models to the backup database.
MIRRORED_APPS = ['users', 'jobs', 'portfolio', 'notifications', 'support', 'auth']

@receiver(post_save)
def mirror_save_to_backup(sender, instance, **kwargs):
    if _signals_muted:
        return
    using = kwargs.get('using', 'default')
    # Only mirror from default to sqlite_backup
    if using == 'default' and sender._meta.app_label in MIRRORED_APPS:
        from django.conf import settings
        if 'sqlite_backup' in settings.DATABASES:
            try:
                # Save the instance to the backup database
                orig_db = instance._state.db
                instance.save(using='sqlite_backup')
                instance._state.db = orig_db
                logger.info(f"Successfully mirrored save of {sender.__name__} (ID: {instance.pk}) to sqlite_backup")
            except Exception as e:
                logger.error(f"Failed to mirror save of {sender.__name__} (ID: {instance.pk}) to sqlite_backup: {e}")

@receiver(post_delete)
def mirror_delete_from_backup(sender, instance, **kwargs):
    if _signals_muted:
        return
    using = kwargs.get('using', 'default')
    if using == 'default' and sender._meta.app_label in MIRRORED_APPS:
        from django.conf import settings
        if 'sqlite_backup' in settings.DATABASES:
            try:
                # Delete the instance from the backup database
                backup_queryset = sender.objects.using('sqlite_backup').filter(pk=instance.pk)
                if backup_queryset.exists():
                    backup_queryset.delete()
                    logger.info(f"Successfully mirrored delete of {sender.__name__} (ID: {instance.pk}) from sqlite_backup")
            except Exception as e:
                logger.error(f"Failed to mirror delete of {sender.__name__} (ID: {instance.pk}) from sqlite_backup: {e}")
