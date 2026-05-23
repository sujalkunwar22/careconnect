import os
from datetime import timedelta
from pathlib import Path

from dotenv import load_dotenv

load_dotenv()

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = os.getenv("DJANGO_SECRET_KEY", "dev-secret-key-change-in-production")

DEBUG = os.getenv("DJANGO_DEBUG", "False") == "True"

ALLOWED_HOSTS = os.getenv("DJANGO_ALLOWED_HOSTS", "*").split(",")

INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    # Third-party
    "rest_framework",
    "rest_framework_simplejwt.token_blacklist",
    "corsheaders",
    "django_filters",
    # Local apps
    "users",
    "portfolio",
    "jobs",
    "notifications",
    "support",
    "core",
]

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "whitenoise.middleware.WhiteNoiseMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "careconnect.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "careconnect.wsgi.application"

try:
    import dj_database_url
except ImportError:
    dj_database_url = None

SUPABASE_DB_PASSWORD = os.getenv("SUPABASE_DB_PASSWORD")
DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL and SUPABASE_DB_PASSWORD:
    DATABASE_URL = f"postgresql://postgres.tjyzribebypemfpmalge:{SUPABASE_DB_PASSWORD}@aws-1-ap-southeast-2.pooler.supabase.com:6543/postgres"

# Auto-rewrite IPv6 direct hostname to IPv4 pooler hostname and force port 6543 (transaction mode)
if DATABASE_URL:
    from urllib.parse import urlparse, urlunparse
    try:
        parsed = urlparse(DATABASE_URL)
        netloc = parsed.netloc
        
        # Replace direct hostname with pooler hostname
        if parsed.hostname == "db.tjyzribebypemfpmalge.supabase.co":
            netloc = netloc.replace("db.tjyzribebypemfpmalge.supabase.co", "aws-1-ap-southeast-2.pooler.supabase.com")
            
        # Ensure correct username prefix and port 6543 for the pooler to run in Transaction Mode
        if "pooler.supabase.com" in netloc:
            if netloc.startswith("postgres:") and not netloc.startswith("postgres.tjyzribebypemfpmalge:"):
                netloc = "postgres.tjyzribebypemfpmalge:" + netloc[len("postgres:"):]
            
            if "@" in netloc:
                auth_part, host_part = netloc.rsplit("@", 1)
                if ":" in host_part:
                    host, _ = host_part.split(":", 1)
                    host_part = f"{host}:6543"
                else:
                    host_part = f"{host_part}:6543"
                netloc = f"{auth_part}@{host_part}"
            else:
                if ":" in netloc:
                    host, _ = netloc.split(":", 1)
                    netloc = f"{host}:6543"
                else:
                    netloc = f"{netloc}:6543"
                    
        parsed = parsed._replace(netloc=netloc)
        DATABASE_URL = urlunparse(parsed)
        os.environ["DATABASE_URL"] = DATABASE_URL
    except Exception:
        pass

# SQLite file paths (supports Render persistent volume disks if attached)
RENDER_DATA_DIR = os.getenv("RENDER_DATA_DIR")
sqlite_path = None
fallback_path = None

if os.getenv("RENDER") and RENDER_DATA_DIR:
    try:
        os.makedirs(RENDER_DATA_DIR, exist_ok=True)
        sqlite_path = os.path.join(RENDER_DATA_DIR, "db.sqlite3")
        fallback_path = os.path.join(RENDER_DATA_DIR, "db_backup_fallback.sqlite3")
    except Exception as e:
        # Fallback to local files if directory creation fails due to permissions
        sqlite_path = BASE_DIR / "db.sqlite3"
        fallback_path = BASE_DIR / "db_backup_fallback.sqlite3"
elif os.getenv("VERCEL"):
    sqlite_path = "/tmp/db.sqlite3"
    fallback_path = "/tmp/db_backup_fallback.sqlite3"
else:
    sqlite_path = BASE_DIR / "db.sqlite3"
    fallback_path = BASE_DIR / "db_backup_fallback.sqlite3"

if dj_database_url and DATABASE_URL:
    DATABASES = {
        "default": dj_database_url.config(
            default=DATABASE_URL,
            conn_max_age=0
        ),
        "sqlite_backup": {
            "ENGINE": "django.db.backends.sqlite3",
            "NAME": sqlite_path,
        }
    }
else:
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.sqlite3",
            "NAME": sqlite_path,
        },
        "sqlite_backup": {
            "ENGINE": "django.db.backends.sqlite3",
            "NAME": fallback_path,
        }
    }


AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

LANGUAGE_CODE = "en-us"
TIME_ZONE = "Asia/Kathmandu"
USE_I18N = True
USE_TZ = True

STATIC_URL = "/static/"
STATIC_ROOT = BASE_DIR / "staticfiles"
STATICFILES_STORAGE = "whitenoise.storage.CompressedStaticFilesStorage"

MEDIA_URL = "/media/"
MEDIA_ROOT = BASE_DIR / "media"

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

AUTH_USER_MODEL = "users.User"

REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ),
    "DEFAULT_PERMISSION_CLASSES": (
        "rest_framework.permissions.IsAuthenticated",
    ),
    "DEFAULT_PAGINATION_CLASS": "rest_framework.pagination.PageNumberPagination",
    "PAGE_SIZE": 20,
    "DEFAULT_FILTER_BACKENDS": [
        "django_filters.rest_framework.DjangoFilterBackend",
        "rest_framework.filters.SearchFilter",
        "rest_framework.filters.OrderingFilter",
    ],
}

SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(minutes=60),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=7),
    "ROTATE_REFRESH_TOKENS": True,
    "BLACKLIST_AFTER_ROTATION": True,
    "AUTH_HEADER_TYPES": ("Bearer",),
}

CORS_ALLOW_ALL_ORIGINS = True

# File upload limits
DATA_UPLOAD_MAX_MEMORY_SIZE = 10 * 1024 * 1024  # 10MB
FILE_UPLOAD_MAX_MEMORY_SIZE = 5 * 1024 * 1024  # 5MB

# Logging — send all errors to stdout so Render logs capture them
LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {
        "verbose": {
            "format": "{levelname} {asctime} {module} {message}",
            "style": "{",
        },
    },
    "handlers": {
        "console": {
            "class": "logging.StreamHandler",
            "formatter": "verbose",
        },
    },
    "root": {
        "handlers": ["console"],
        "level": "INFO",
    },
    "loggers": {
        "django": {
            "handlers": ["console"],
            "level": "WARNING",
            "propagate": False,
        },
        "core": {
            "handlers": ["console"],
            "level": "INFO",
            "propagate": False,
        },
    },
}

# Supabase settings
SUPABASE_URL = os.getenv("SUPABASE_URL") or os.getenv("VITE_SUPABASE_URL") or "https://tjyzribebypemfpmalge.supabase.co"
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY") or os.getenv("VITE_SUPABASE_ANON_KEY") or "sb_publishable_lCjfHZ9FyxUCtslHhK_sSQ_FUOgtDzq"

# Email Settings (SMTP via Gmail)
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'smtp.gmail.com'
EMAIL_PORT = 587
EMAIL_USE_TLS = True
EMAIL_HOST_USER = os.getenv("EMAIL_HOST_USER")
EMAIL_HOST_PASSWORD = os.getenv("EMAIL_HOST_PASSWORD")
DEFAULT_FROM_EMAIL = os.getenv("DEFAULT_FROM_EMAIL", EMAIL_HOST_USER)

