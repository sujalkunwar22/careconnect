from rest_framework.permissions import BasePermission

from .models import User


class IsAdminUser(BasePermission):
    """Only admin users."""
    def has_permission(self, request, view) -> bool:
        return bool(
            request.user and request.user.is_authenticated and request.user.role == User.Roles.ADMIN
        )


class IsNGOUser(BasePermission):
    """Only NGO users."""
    def has_permission(self, request, view) -> bool:
        return bool(
            request.user and request.user.is_authenticated and request.user.role == User.Roles.NGO
        )


class IsProfessionalUser(BasePermission):
    """Only professional (user role) users."""
    def has_permission(self, request, view) -> bool:
        return bool(
            request.user and request.user.is_authenticated and request.user.role == User.Roles.USER
        )


class IsNGOOwner(BasePermission):
    """NGO can only modify their own jobs."""
    def has_object_permission(self, request, view, obj) -> bool:
        return obj.posted_by == request.user


class IsVerifiedProfessional(BasePermission):
    """Professional user with verified KYC."""
    def has_permission(self, request, view) -> bool:
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.role == User.Roles.USER
            and request.user.is_kyc_verified
        )
