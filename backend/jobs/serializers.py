from rest_framework import serializers
from core.fields import SupabaseFileField
from .models import Job, Application


class JobListSerializer(serializers.ModelSerializer):
    ngo_name = serializers.SerializerMethodField()
    applicant_count = serializers.IntegerField(read_only=True, default=0)
    ngo_verified = serializers.SerializerMethodField()
    has_applied = serializers.SerializerMethodField()
    is_active = serializers.SerializerMethodField()

    class Meta:
        model = Job
        fields = [
            "id", "title", "description", "category", "location",
            "employment_type", "remote", "salary_min", "salary_max",
            "requirements", "skills_required", "status", "is_active", "views_count",
            "deadline", "created_at", "updated_at",
            "posted_by", "ngo_name", "ngo_verified", "applicant_count",
            "has_applied",
        ]
        read_only_fields = ["id", "views_count", "created_at", "updated_at", "posted_by"]

    def get_is_active(self, obj):
        return obj.status in [Job.Status.OPEN, Job.Status.ACTIVE]

    def get_has_applied(self, obj):
        # First check if the value was already annotated in the queryset
        has_applied = getattr(obj, 'has_applied', None)
        if has_applied is not None:
            return has_applied
            
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return Application.objects.filter(job=obj, applicant=request.user).exists()
        return False

    def get_ngo_name(self, obj):
        if hasattr(obj.posted_by, "ngo_profile"):
            return obj.posted_by.ngo_profile.organization_name
        return obj.posted_by.full_name

    def get_ngo_verified(self, obj):
        if hasattr(obj.posted_by, "ngo_profile"):
            return obj.posted_by.ngo_profile.is_verified
        return False


class JobCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Job
        fields = [
            "id", "title", "description", "category", "location",
            "employment_type", "remote", "salary_min", "salary_max",
            "requirements", "skills_required", "status", "deadline",
        ]
        read_only_fields = ["id"]


class ApplicationSerializer(serializers.ModelSerializer):
    applicant_name = serializers.CharField(source="applicant.full_name", read_only=True)
    applicant_email = serializers.EmailField(source="applicant.email", read_only=True)
    applicant_title = serializers.CharField(source="applicant.professional_title", read_only=True)
    applicant_skills = serializers.JSONField(source="applicant.skills", read_only=True)
    applicant_bio = serializers.CharField(source="applicant.bio", read_only=True)
    applicant_kyc_verified = serializers.BooleanField(source="applicant.is_kyc_verified", read_only=True)
    job_title = serializers.CharField(source="job.title", read_only=True)
    ngo_name = serializers.SerializerMethodField()
    applicant_experience = serializers.SerializerMethodField(read_only=True)
    applicant_education = serializers.SerializerMethodField(read_only=True)
    applicant_certifications = serializers.SerializerMethodField(read_only=True)
    applicant_profile_image = serializers.SerializerMethodField(read_only=True)
    applicant_portfolio = serializers.SerializerMethodField(read_only=True)
    cv_file = SupabaseFileField(required=False, allow_null=True)

    class Meta:
        model = Application
        fields = [
            "id", "job", "job_title", "ngo_name",
            "applicant", "applicant_name", "applicant_email",
            "applicant_title", "applicant_skills", "applicant_bio",
            "applicant_kyc_verified",
            "cover_letter", "application_type", "cv_file", "status", "interview_details",
            "rejection_reason", "rejection_category",
            "created_at", "updated_at",
            "applicant_experience", "applicant_education", "applicant_certifications",
            "applicant_profile_image", "applicant_portfolio",
        ]
        read_only_fields = [
            "id", "applicant", "status", "interview_details",
            "rejection_reason", "rejection_category", "created_at", "updated_at",
        ]

    def get_ngo_name(self, obj):
        if hasattr(obj.job.posted_by, "ngo_profile"):
            return obj.job.posted_by.ngo_profile.organization_name
        return obj.job.posted_by.full_name

    def get_applicant_experience(self, obj):
        from portfolio.serializers import ExperienceSerializer
        return ExperienceSerializer(obj.applicant.experiences.all(), many=True).data

    def get_applicant_education(self, obj):
        from portfolio.serializers import EducationSerializer
        return EducationSerializer(obj.applicant.education.all(), many=True).data

    def get_applicant_certifications(self, obj):
        from portfolio.serializers import CertificationSerializer
        return CertificationSerializer(obj.applicant.certifications.all(), many=True).data

    def get_applicant_profile_image(self, obj):
        if obj.applicant.profile_image:
            name_str = str(obj.applicant.profile_image.name)
            if name_str.startswith('http://') or name_str.startswith('https://'):
                return name_str
            request = self.context.get("request")
            if request:
                return request.build_absolute_uri(obj.applicant.profile_image.url)
            return obj.applicant.profile_image.url
        return None

    def get_applicant_portfolio(self, obj):
        from portfolio.serializers import ExperienceSerializer, EducationSerializer, CertificationSerializer
        return {
            "bio": obj.applicant.bio,
            "skills": obj.applicant.skills if isinstance(obj.applicant.skills, list) else [],
            "experiences": ExperienceSerializer(obj.applicant.experiences.all(), many=True).data,
            "education": EducationSerializer(obj.applicant.education.all(), many=True).data,
            "certifications": CertificationSerializer(obj.applicant.certifications.all(), many=True).data,
        }



class ApplicationApplySerializer(serializers.ModelSerializer):
    cv_file = SupabaseFileField(required=False, allow_null=True)

    class Meta:
        model = Application
        fields = ["id", "job", "cover_letter", "application_type", "cv_file"]
        read_only_fields = ["id"]
