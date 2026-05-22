from __future__ import annotations

from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from django.db.models import Q
from rest_framework import serializers

from core.fields import SupabaseImageField
from .models import KYCDocument, NGOProfile, OTP, User


class NGOProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = NGOProfile
        fields = [
            "organization_name", "registration_number", "sector",
            "description", "website", "is_verified",
        ]
        read_only_fields = ["is_verified"]


class UserSerializer(serializers.ModelSerializer):
    ngo_profile = NGOProfileSerializer(read_only=True)
    experiences = serializers.SerializerMethodField(read_only=True)
    education = serializers.SerializerMethodField(read_only=True)
    certifications = serializers.SerializerMethodField(read_only=True)
    profile_image = SupabaseImageField(required=False, allow_null=True)

    class Meta:
        model = User
        fields = [
            "id", "username", "email", "phone_number", "role",
            "full_name", "bio", "professional_title", "skills",
            "address", "municipality", "ward", "profile_image",
            "is_kyc_verified", "is_active", "date_joined", "ngo_profile",
            "experiences", "education", "certifications",
        ]
        read_only_fields = ["id", "is_kyc_verified", "username", "date_joined", "is_active"]

    def get_experiences(self, obj):
        from portfolio.serializers import ExperienceSerializer
        return ExperienceSerializer(obj.experiences.all(), many=True).data

    def get_education(self, obj):
        from portfolio.serializers import EducationSerializer
        return EducationSerializer(obj.education.all(), many=True).data

    def get_certifications(self, obj):
        from portfolio.serializers import CertificationSerializer
        return CertificationSerializer(obj.certifications.all(), many=True).data


class AdminUserSerializer(serializers.ModelSerializer):
    """Admin can edit any field including role and is_active."""
    ngo_profile = NGOProfileSerializer(read_only=True)
    experiences = serializers.SerializerMethodField(read_only=True)
    education = serializers.SerializerMethodField(read_only=True)
    certifications = serializers.SerializerMethodField(read_only=True)
    profile_image = SupabaseImageField(required=False, allow_null=True)

    class Meta:
        model = User
        fields = [
            "id", "username", "email", "phone_number", "role",
            "full_name", "bio", "professional_title", "skills",
            "address", "municipality", "ward", "profile_image",
            "is_kyc_verified", "is_active", "date_joined", "ngo_profile",
            "experiences", "education", "certifications",
        ]
        read_only_fields = ["id", "username", "date_joined"]

    def get_experiences(self, obj):
        from portfolio.serializers import ExperienceSerializer
        return ExperienceSerializer(obj.experiences.all(), many=True).data

    def get_education(self, obj):
        from portfolio.serializers import EducationSerializer
        return EducationSerializer(obj.education.all(), many=True).data

    def get_certifications(self, obj):
        from portfolio.serializers import CertificationSerializer
        return CertificationSerializer(obj.certifications.all(), many=True).data



class RegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    organization_name = serializers.CharField(write_only=True, required=False, allow_blank=True)
    registration_number = serializers.CharField(write_only=True, required=False, allow_blank=True)
    sector = serializers.CharField(write_only=True, required=False, allow_blank=True)
    website = serializers.CharField(write_only=True, required=False, allow_blank=True)

    class Meta:
        model = User
        fields = [
            "id", "email", "phone_number", "password", "role",
            "full_name", "professional_title", "bio",
            "address", "municipality", "ward",
            "organization_name", "registration_number", "sector", "website",
        ]

    def validate_password(self, value: str) -> str:
        validate_password(value)
        return value

    def validate(self, attrs):
        email = attrs.get("email", "").strip().lower()
        phone_number = attrs.get("phone_number", "").strip()

        if not email and not phone_number:
            raise serializers.ValidationError("Either email address or phone number is required for registration.")

        # Normalize phone number
        if phone_number:
            phone_number = "".join(ch for ch in phone_number if ch.isdigit() or ch == "+")
            attrs["phone_number"] = phone_number
        else:
            attrs["phone_number"] = None

        if not email:
            attrs["email"] = None

        # Pre-emptively check for uniqueness on normalized fields
        username = email or phone_number
        if User.objects.filter(Q(username=username) | Q(email=email) | Q(phone_number=phone_number)).exclude(email=None, phone_number=None).exists():
            raise serializers.ValidationError({"email": "A user with this email or phone number already exists."})

        return attrs

    def create(self, validated_data):
        password = validated_data.pop("password")
        org_name = validated_data.pop("organization_name", "")
        reg_number = validated_data.pop("registration_number", "")
        sector = validated_data.pop("sector", "")
        website = validated_data.pop("website", "")

        # Use email or phone as the unique username
        username = validated_data.get("email") or validated_data.get("phone_number")
        
        user = User(username=username, **validated_data)
        user.set_password(password)
        user.save()

        # Check role string directly to ensure profile creation
        if user.role == "ngo":
            NGOProfile.objects.create(
                user=user,
                organization_name=org_name or user.full_name or "NGO Profile",
                registration_number=reg_number,
                sector=sector,
                website=website,
            )

        from rest_framework_simplejwt.tokens import RefreshToken
        refresh = RefreshToken.for_user(user)

        return {
            "user": user,
            "access": str(refresh.access_token),
            "refresh": str(refresh),
        }

    def to_representation(self, instance):
        if isinstance(instance, dict):
            user = instance["user"]
            return {
                "access": instance["access"],
                "refresh": instance["refresh"],
                "user": UserSerializer(user).data,
            }
        return UserSerializer(instance).data


class LoginSerializer(serializers.Serializer):
    identifier = serializers.CharField(required=False, allow_blank=True)
    email = serializers.CharField(required=False, allow_blank=True)
    phone_number = serializers.CharField(required=False, allow_blank=True)
    username = serializers.CharField(required=False, allow_blank=True)
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        # Support multiple keys for the login identifier from both validated attrs and initial data
        initial_data = getattr(self, "initial_data", {})
        
        # DEBUG: Log received data to console (stdout)
        print(f"LOGIN DEBUG: Attrs: {attrs}")
        print(f"LOGIN DEBUG: Initial Data: {initial_data}")
        
        raw_identifier = (
            attrs.get("identifier")
            or attrs.get("email")
            or attrs.get("phone_number")
            or attrs.get("username")
            or initial_data.get("identifier")
            or initial_data.get("email")
            or initial_data.get("phone_number")
            or initial_data.get("username")
        )
        
        raw_password = attrs.get("password") or initial_data.get("password")
        
        # Clean up the identifier from invisible characters
        identifier = (str(raw_identifier) if raw_identifier else "").replace("\u200b", "").replace("\ufeff", "").strip()
        password = str(raw_password) if raw_password else ""

        if not identifier:
            raise serializers.ValidationError({"identifier": "Email, phone number or username is required."})
        
        if not password:
            raise serializers.ValidationError({"password": "Password is required."})

        # 1. Try direct authentication (matches username field)
        print(f"DEBUG: Step 1 - Trying direct auth with username={identifier}")
        user = authenticate(username=identifier, password=password)
        print(f"DEBUG: Step 1 Result - User: {user}")

        # 2. Try email lookup if not authenticated yet
        if not user:
            print(f"DEBUG: Step 2 - Trying email/username iexact lookup for {identifier}")
            try:
                user_obj = User.objects.filter(Q(email__iexact=identifier) | Q(username__iexact=identifier)).first()
                print(f"DEBUG: Step 2 - Found user_obj: {user_obj}")
                if user_obj:
                    user = authenticate(username=user_obj.username, password=password)
                    print(f"DEBUG: Step 2 Auth Result - User: {user}")
            except Exception as e:
                print(f"DEBUG: Step 2 Exception - {e}")
                pass

        # 3. Try phone number backup if not authenticated yet
        if not user:
            print(f"DEBUG: Step 3 - Trying phone number lookup for {identifier}")
            normalized_phone = "".join(ch for ch in identifier if ch.isdigit() or ch == "+")
            if len(normalized_phone) >= 7:
                try:
                    user_obj = User.objects.get(phone_number=normalized_phone)
                    print(f"DEBUG: Step 3 - Found user_obj by phone: {user_obj}")
                    user = authenticate(username=user_obj.username, password=password)
                    print(f"DEBUG: Step 3 Auth Result - User: {user}")
                except User.DoesNotExist:
                    print(f"DEBUG: Step 3 - No user found by phone")
                    pass

        if not user:
            print(f"DEBUG: Auth failed for identifier={identifier}")
            # Check if user exists at all to give better feedback
            # Using non_field_errors to ensure frontend toast catches it easily
            raise serializers.ValidationError({"non_field_errors": ["Invalid credentials. Please check your email/phone and password."]})

        if not user.is_active:
            raise serializers.ValidationError({"non_field_errors": ["Account is deactivated. Please contact support."]})

        attrs["user"] = user
        return attrs


class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True)

    def validate_new_password(self, value):
        validate_password(value)
        return value


class KYCSubmitSerializer(serializers.ModelSerializer):
    front_image = SupabaseImageField()
    back_image = SupabaseImageField(required=False, allow_null=True)
    selfie_image = SupabaseImageField()

    def validate_document_type(self, value):
        # Frontend sends "license"; model uses "drivers_license".
        if value == "license":
            return KYCDocument.DocType.DRIVERS_LICENSE
        return value

    class Meta:
        model = KYCDocument
        fields = [
            "id", "document_type", "front_image", "back_image",
            "selfie_image", "status", "created_at",
        ]
        read_only_fields = ["id", "status", "created_at"]


class KYCDocumentSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source="user.full_name", read_only=True)
    user_email = serializers.EmailField(source="user.email", read_only=True)
    user_role = serializers.CharField(source="user.role", read_only=True)
    front_image = SupabaseImageField(read_only=True)
    back_image = SupabaseImageField(read_only=True, allow_null=True)
    selfie_image = SupabaseImageField(read_only=True)

    class Meta:
        model = KYCDocument
        fields = [
            "id", "user", "user_name", "user_email", "user_role",
            "document_type", "front_image", "back_image", "selfie_image",
            "status", "rejection_reason", "admin_notes",
            "created_at", "reviewed_at", "reviewed_by",
        ]
        read_only_fields = [
            "id", "user", "user_name", "user_email", "user_role",
            "status", "rejection_reason", "admin_notes",
            "created_at", "reviewed_at", "reviewed_by",
        ]


class OTPSerializer(serializers.ModelSerializer):
    class Meta:
        model = OTP
        fields = ["phone_number", "code"]
        read_only_fields = ["code"]
