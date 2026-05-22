from rest_framework import serializers
from core.fields import SupabaseImageField
from .models import Ticket


class TicketSerializer(serializers.ModelSerializer):
    attachment = SupabaseImageField(required=False, allow_null=True)

    class Meta:
        model = Ticket
        fields = [
            "id",
            "subject",
            "description",
            "priority",
            "status",
            "attachment",
            "response",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ("id", "status", "response", "created_at", "updated_at")


class AdminTicketSerializer(serializers.ModelSerializer):
    user_name = serializers.ReadOnlyField(source='user.full_name')
    user_email = serializers.ReadOnlyField(source='user.email')
    attachment = SupabaseImageField(required=False, allow_null=True)

    class Meta:
        model = Ticket
        fields = [
            "id",
            "subject",
            "description",
            "priority",
            "status",
            "attachment",
            "response",
            "created_at",
            "updated_at",
            "user_name",
            "user_email",
        ]
        read_only_fields = ("id", "created_at", "updated_at")
