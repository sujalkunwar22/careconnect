from django.db.models import Sum
from django.utils import timezone
from rest_framework import generics, views, status, permissions
from rest_framework.response import Response

from .models import Experience, Education, Certification, CareActivity
from .serializers import (
    ExperienceSerializer,
    EducationSerializer,
    CertificationSerializer,
    PortfolioSerializer,
    CareActivitySerializer,
)


# ─── FULL PORTFOLIO ──────────────────────────────────


class PortfolioView(views.APIView):
    """Get the user's full portfolio (all sections)."""

    def get(self, request, *args, **kwargs):
        user = request.user
        
        # Ensure skills is a list for the frontend
        skills = user.skills
        if isinstance(skills, str):
            skills = [s.strip() for s in skills.split(",") if s.strip()]
        elif not skills:
            skills = []

        experiences = ExperienceSerializer(user.experiences.all(), many=True).data
        # Map backend fields to frontend expected names for display compatibility
        for exp in experiences:
            exp["title"] = exp.get("job_title")
            exp["company"] = exp.get("organization")
            start = exp.get("start_date")
            end = exp.get("end_date") or "Present"
            exp["period"] = f"{start} - {end}"
            # Split description by newlines to create bullets
            desc = exp.get("description", "")
            exp["bullets"] = [b.strip() for b in desc.split("\n") if b.strip()] if desc else []

        education = EducationSerializer(user.education.all(), many=True).data
        for edu in education:
            start = edu.get("start_year")
            end = edu.get("end_year") or "Present"
            edu["year"] = f"{start} - {end}"
            # Frontend also uses certName/certIssuer for education styling in some places
            edu["certName"] = edu.get("degree")
            edu["certIssuer"] = edu.get("institution")
            edu["certDate"] = edu.get("year")

        certifications = CertificationSerializer(user.certifications.all(), many=True).data
        for cert in certifications:
            cert["issuer"] = cert.get("issuing_organization")
            cert["date"] = cert.get("issue_date")
            # For consistent styling
            cert["certName"] = cert.get("name")
            cert["certIssuer"] = cert.get("issuer")
            cert["certDate"] = cert.get("date")

        data = {
            "bio": user.bio or "Professional summary not provided yet.",
            "skills": skills,
            "experience": experiences, # Screen expects 'experience'
            "experiences": experiences, # Fallback
            "education": education,
            "certifications": certifications,
        }
        return Response(data)


# ─── EXPERIENCE ───────────────────────────────────────


class ExperienceListCreateView(generics.ListCreateAPIView):
    serializer_class = ExperienceSerializer

    def get_queryset(self):
        return Experience.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class ExperienceDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ExperienceSerializer

    def get_queryset(self):
        return Experience.objects.filter(user=self.request.user)


# ─── EDUCATION ────────────────────────────────────────


class EducationListCreateView(generics.ListCreateAPIView):
    serializer_class = EducationSerializer

    def get_queryset(self):
        return Education.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class EducationDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = EducationSerializer

    def get_queryset(self):
        return Education.objects.filter(user=self.request.user)


# ─── CERTIFICATION ────────────────────────────────────


class CertificationListCreateView(generics.ListCreateAPIView):
    serializer_class = CertificationSerializer

    def get_queryset(self):
        return Certification.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class CertificationDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = CertificationSerializer

    def get_queryset(self):
        return Certification.objects.filter(user=self.request.user)


class CareActivityListCreateView(generics.ListCreateAPIView):
    serializer_class = CareActivitySerializer

    def get_queryset(self):
        return CareActivity.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class CareActivityStatsView(views.APIView):
    def get(self, request, *args, **kwargs):
        qs = CareActivity.objects.filter(user=request.user)
        total_hours = qs.aggregate(total=Sum("hours")).get("total") or 0
        verified_activities = qs.filter(status=CareActivity.Status.VERIFIED).count()
        skills_count = len(getattr(request.user, "skills", []) or [])
        return Response({
            "total_hours": float(total_hours),
            "verified_activities": verified_activities,
            "skills_count": skills_count,
        })


class PendingActivitiesView(generics.ListAPIView):
    serializer_class = CareActivitySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return CareActivity.objects.filter(status=CareActivity.Status.PENDING)


class VerifyActivityView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk, action, *args, **kwargs):
        try:
            activity = CareActivity.objects.get(pk=pk)
        except CareActivity.DoesNotExist:
            return Response({"detail": "Activity not found."}, status=status.HTTP_404_NOT_FOUND)

        if action == "verify":
            activity.status = CareActivity.Status.VERIFIED
            activity.rejection_reason = ""
        elif action == "reject":
            activity.status = CareActivity.Status.REJECTED
            activity.rejection_reason = request.data.get("reason", "")
        else:
            return Response({"detail": "Invalid action."}, status=status.HTTP_400_BAD_REQUEST)

        activity.reviewed_by = request.user
        activity.reviewed_at = timezone.now()
        activity.save()
        return Response(CareActivitySerializer(activity).data)
