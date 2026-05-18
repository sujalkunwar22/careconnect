from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path

urlpatterns = [
    path("admin/", admin.site.urls),

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
