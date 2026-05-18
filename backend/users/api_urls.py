from django.urls import path
from . import views

urlpatterns = [
    # Profile
    path("me/", views.ProfileView.as_view(), name="profile"),
    path("profile/", views.ProfileView.as_view(), name="profile-legacy"),
    path("me/change-password/", views.ChangePasswordView.as_view(), name="change-password"),

    # KYC
    path("kyc/submit/", views.KYCSubmitView.as_view(), name="kyc-submit"),
    path("kyc/status/", views.KYCStatusView.as_view(), name="kyc-status"),
]
