from django.urls import path
from . import views

urlpatterns = [
    path("", views.PortfolioView.as_view(), name="portfolio"),

    path("experiences/", views.ExperienceListCreateView.as_view(), name="experience-list"),
    path("experiences/<int:pk>/", views.ExperienceDetailView.as_view(), name="experience-detail"),

    path("education/", views.EducationListCreateView.as_view(), name="education-list"),
    path("education/<int:pk>/", views.EducationDetailView.as_view(), name="education-detail"),

    path("certifications/", views.CertificationListCreateView.as_view(), name="certification-list"),
    path("certifications/<int:pk>/", views.CertificationDetailView.as_view(), name="certification-detail"),

    path("activities/", views.CareActivityListCreateView.as_view(), name="activity-list"),
    path("activities/stats/", views.CareActivityStatsView.as_view(), name="activity-stats"),
    path("activities/pending/", views.PendingActivitiesView.as_view(), name="activity-pending"),
    path("activities/<int:pk>/<str:action>/", views.VerifyActivityView.as_view(), name="activity-action"),
]
