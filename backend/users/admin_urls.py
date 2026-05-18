from django.urls import path
from users import views

urlpatterns = [
    # Users management
    path("users/", views.AdminUserListView.as_view(), name="admin-users"),
    path("users/<int:pk>/", views.AdminUserUpdateView.as_view(), name="admin-user-update"),
    path("users/<int:pk>/delete/", views.AdminUserDeleteView.as_view(), name="admin-user-delete"),
    path("users/<int:pk>/toggle-status/", views.AdminToggleUserStatusView.as_view(), name="admin-user-toggle"),

    # Stats
    path("stats/", views.AdminStatsView.as_view(), name="admin-stats"),

    # KYC management
    path("kyc/", views.AdminKYCListView.as_view(), name="admin-kyc-list"),
    path("kyc/<int:pk>/", views.AdminKYCDetailView.as_view(), name="admin-kyc-detail"),
    path("kyc/<int:pk>/approve/", views.AdminKYCApproveView.as_view(), name="admin-kyc-approve"),
    path("kyc/<int:pk>/reject/", views.AdminKYCRejectView.as_view(), name="admin-kyc-reject"),
    path("kyc/<int:pk>/request-info/", views.AdminKYCRequestInfoView.as_view(), name="admin-kyc-request-info"),
]
