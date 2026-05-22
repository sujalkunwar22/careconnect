from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.http import JsonResponse
from django.urls import include, path


def health_check(request):
    """Simple health check — no DB, no auth. If this 500s, the app itself can't start."""
    return JsonResponse({"status": "ok"})


def db_test(request):
    """Test database connectivity and return diagnostics."""
    from django.db import connection
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
        return JsonResponse({
            "database": "connected",
            "vendor": connection.vendor,
            "host": connection.settings_dict.get("HOST", ""),
        })
    except Exception as e:
        return JsonResponse({
            "database": "error",
            "error": str(e),
        }, status=500)


def root_view(request):
    """Welcome and diagnostics root endpoint."""
    return JsonResponse({
        "name": "CareConnect API Backend",
        "status": "online",
        "endpoints": {
            "health": "/api/health/",
            "db_test": "/api/dbtest/",
            "admin": "/admin/"
        }
    })


urlpatterns = [
    path("", root_view, name="api-root"),
    path("admin/", admin.site.urls),

    # Diagnostics
    path("api/health/", health_check, name="health-check"),
    path("api/dbtest/", db_test, name="db-test"),

    # Auth
    path("api/auth/", include("users.api_auth_urls")),

    # User profile & KYC
    path("api/users/", include("users.api_urls")),

    # Admin portal
    path("api/admin/", include("users.admin_urls")),

    # Jobs (public + professional + NGO + admin)
    path("api/jobs/", include("jobs.api_urls")),

    # Portfolio
    path("api/portfolio/", include("portfolio.api_urls")),

    # Notifications
    path("api/notifications/", include("notifications.api_urls")),

    # Support tickets
    path("api/support/", include("support.api_urls")),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
