import os
import sys
from pathlib import Path

# Add backend directory to path so imports like 'careconnect.settings' resolve correctly
BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BASE_DIR))

from django.core.wsgi import get_wsgi_application

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "careconnect.settings")

application = get_wsgi_application()
app = application


