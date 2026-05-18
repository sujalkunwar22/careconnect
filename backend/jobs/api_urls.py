from django.urls import path
from . import views

urlpatterns = [
    # Public
    path("", views.JobListView.as_view(), name="job-list"),
    path("<int:pk>/", views.JobDetailView.as_view(), name="job-detail"),
    path("<int:pk>/apply/", views.JobApplyView.as_view(), name="job-apply"),

    # Professional
    path("applications/me/", views.MyApplicationsView.as_view(), name="my-applications"),

    # NGO
    path("ngo/create/", views.NgoJobCreateView.as_view(), name="ngo-job-create"),
    path("ngo/", views.NgoJobsView.as_view(), name="ngo-jobs"),
    path("ngo/stats/", views.NgoStatsView.as_view(), name="ngo-stats"),
    path("ngo/<int:pk>/", views.NgoJobUpdateView.as_view(), name="ngo-job-update"),
    path("ngo/<int:pk>/delete/", views.NgoJobDeleteView.as_view(), name="ngo-job-delete"),
    path("ngo/applications/", views.NgoApplicationsView.as_view(), name="ngo-applications"),
    path("ngo/applications/<int:pk>/", views.NgoApplicationDetailView.as_view(), name="ngo-application-detail"),
    path("ngo/applications/<int:pk>/approve/", views.NgoApproveApplicationView.as_view(), name="ngo-approve"),
    path("ngo/applications/<int:pk>/reject/", views.NgoRejectApplicationView.as_view(), name="ngo-reject"),

    # Admin
    path("admin/", views.AdminJobsView.as_view(), name="admin-jobs"),
    path("admin/<int:pk>/toggle/", views.AdminToggleJobView.as_view(), name="admin-job-toggle"),
    path("admin/<int:pk>/delete/", views.AdminDeleteJobView.as_view(), name="admin-job-delete"),
]
