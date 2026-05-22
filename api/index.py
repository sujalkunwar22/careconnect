import os
import sys
from pathlib import Path

# Add backend directory to sys.path so careconnect and its sub-apps can be imported
BASE_DIR = Path(__file__).resolve().parent.parent / "backend"
sys.path.insert(0, str(BASE_DIR))

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "careconnect.settings")

from django.core.wsgi import get_wsgi_application
application = get_wsgi_application()
app = application
