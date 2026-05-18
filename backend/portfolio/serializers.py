from rest_framework import serializers
from .models import Experience, Education, Certification, CareActivity


class ExperienceSerializer(serializers.ModelSerializer):
    title = serializers.CharField(source="job_title", required=False)
    company = serializers.CharField(source="organization", required=False)

    class Meta:
        model = Experience
        fields = [
            "id", "job_title", "organization", "start_date", "end_date",
            "is_current", "description", "skills_used", "created_at",
            "title", "company",
        ]
        read_only_fields = ["id", "created_at"]

    def to_internal_value(self, data):
        # Map frontend aliases if provided
        if "title" in data and "job_title" not in data:
            data["job_title"] = data.pop("title")
        if "company" in data and "organization" not in data:
            data["organization"] = data.pop("company")
        if "startDate" in data and "start_date" not in data:
            data["start_date"] = data.pop("startDate")
        if "endDate" in data and "end_date" not in data:
            data["end_date"] = data.pop("endDate")
        if "isCurrent" in data and "is_current" not in data:
            data["is_current"] = data.pop("isCurrent")
        return super().to_internal_value(data)


class EducationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Education
        fields = [
            "id", "degree", "institution", "field_of_study",
            "start_year", "end_year", "created_at",
        ]
        read_only_fields = ["id", "created_at"]

    def to_internal_value(self, data):
        if "fieldOfStudy" in data and "field_of_study" not in data:
            data["field_of_study"] = data.pop("fieldOfStudy")
        if "startYear" in data and "start_year" not in data:
            data["start_year"] = data.pop("startYear")
        if "endYear" in data and "end_year" not in data:
            data["end_year"] = data.pop("endYear")
        return super().to_internal_value(data)


class CertificationSerializer(serializers.ModelSerializer):
    issuer = serializers.CharField(source="issuing_organization", required=False)
    date = serializers.DateField(source="issue_date", required=False)

    class Meta:
        model = Certification
        fields = [
            "id", "name", "issuing_organization", "issue_date",
            "credential_url", "created_at",
            "issuer", "date",
        ]
        read_only_fields = ["id", "created_at"]

    def to_internal_value(self, data):
        if "issuer" in data and "issuing_organization" not in data:
            data["issuing_organization"] = data.pop("issuer")
        if "date" in data and "issue_date" not in data:
            data["issue_date"] = data.pop("date")
        if "credentialUrl" in data and "credential_url" not in data:
            data["credential_url"] = data.pop("credentialUrl")
        return super().to_internal_value(data)


class PortfolioSerializer(serializers.Serializer):
    """Read-only composite serializer for the full portfolio."""
    experiences = ExperienceSerializer(many=True)
    education = EducationSerializer(many=True)
    certifications = CertificationSerializer(many=True)


class CareActivitySerializer(serializers.ModelSerializer):
    caregiver_name = serializers.CharField(source="user.full_name", read_only=True)

    class Meta:
        model = CareActivity
        fields = [
            "id",
            "title",
            "category",
            "hours",
            "date",
            "description",
            "location",
            "status",
            "rejection_reason",
            "created_at",
            "caregiver_name",
        ]
        read_only_fields = [
            "id",
            "status",
            "rejection_reason",
            "created_at",
            "caregiver_name",
        ]
