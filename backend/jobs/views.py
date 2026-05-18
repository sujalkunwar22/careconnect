from django.db.models import Count, Exists, OuterRef, Value, BooleanField
from rest_framework import generics, permissions, status, views
from rest_framework.permissions import BasePermission
from rest_framework.response import Response

from users.models import User
from users.permissions import IsAdminUser, IsNGOUser, IsProfessionalUser, IsVerifiedProfessional
from .models import Job, Application
from .serializers import (
    JobListSerializer,
    JobCreateSerializer,
    ApplicationSerializer,
    ApplicationApplySerializer,
)


class IsAdminOrNGOOwner(BasePermission):
    """Allow admins or the NGO that owns the job."""

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.role in [User.Roles.ADMIN, User.Roles.NGO]
        )

    def has_object_permission(self, request, view, obj):
        return request.user.role == User.Roles.ADMIN or obj.posted_by == request.user


# ─── PUBLIC JOBS ──────────────────────────────────────


from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter

class JobListView(generics.ListAPIView):
    """List active jobs — public access."""
    serializer_class = JobListSerializer
    permission_classes = [permissions.AllowAny]
    filter_backends = [DjangoFilterBackend, SearchFilter]
    filterset_fields = ["category", "employment_type", "remote", "location"]
    search_fields = ["title", "description", "location", "skills_required"]

    def get_queryset(self):
        qs = Job.objects.filter(status__in=[Job.Status.OPEN, Job.Status.ACTIVE]).annotate(
            applicant_count=Count("applications")
        ).select_related("posted_by__ngo_profile")
        
        # Handle title filtering manually since it's not in filterset_fields for exact match
        title = self.request.query_params.get('title')
        if title:
            qs = qs.filter(title__icontains=title)

        user = self.request.user
        if user.is_authenticated:
            has_applied_subquery = Application.objects.filter(
                job=OuterRef('pk'), 
                applicant=user
            )
            qs = qs.annotate(has_applied=Exists(has_applied_subquery))
        else:
            qs = qs.annotate(has_applied=Value(False, output_field=BooleanField()))
            
        return qs


class JobDetailView(generics.RetrieveAPIView):
    """Get job detail — increments views_count."""
    serializer_class = JobListSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        qs = Job.objects.annotate(
            applicant_count=Count("applications")
        ).select_related("posted_by__ngo_profile")
        
        user = self.request.user
        if user.is_authenticated:
            has_applied_subquery = Application.objects.filter(
                job=OuterRef('pk'), 
                applicant=user
            )
            qs = qs.annotate(has_applied=Exists(has_applied_subquery))
        else:
            qs = qs.annotate(has_applied=Value(False, output_field=BooleanField()))
            
        return qs

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        Job.objects.filter(pk=instance.pk).update(views_count=instance.views_count + 1)
        serializer = self.get_serializer(instance)
        return Response(serializer.data)


# ─── JOB APPLY ────────────────────────────────────────


class JobApplyView(views.APIView):
    """Apply to a job — requires verified KYC."""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk, *args, **kwargs):
        user = request.user

        if user.role != "user":
            print(f"DEBUG: Job apply failed - User {user.username} has role {user.role}, expected 'user'")
            return Response(
                {"detail": f"Only professionals can apply for jobs. Your role: {user.role}"},
                status=status.HTTP_403_FORBIDDEN,
            )

        # Temporarily disabled for easier testing
        # if not user.is_kyc_verified:
        #     return Response(
        #         {"detail": "KYC verification is required to apply for jobs."},
        #         status=status.HTTP_403_FORBIDDEN,
        #     )

        try:
            job = Job.objects.get(pk=pk, status__in=[Job.Status.OPEN, Job.Status.ACTIVE])
        except Job.DoesNotExist:
            return Response({"detail": "Job not found or closed."}, status=status.HTTP_404_NOT_FOUND)

        if Application.objects.filter(job=job, applicant=user).exists():
            return Response(
                {"detail": "You have already applied for this job."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        cover_letter = request.data.get("cover_letter", "")
        application_type = request.data.get("application_type", "portfolio")
        cv_file = request.FILES.get("cv_file") or request.data.get("cv_file")

        # Set cv_file to None if application type is portfolio to keep database clean
        actual_cv_file = cv_file if application_type == "cv" else None

        application = Application.objects.create(
            job=job,
            applicant=user,
            cover_letter=cover_letter,
            application_type=application_type,
            cv_file=actual_cv_file
        )
        return Response(
            ApplicationSerializer(application).data,
            status=status.HTTP_201_CREATED,
        )


# ─── PROFESSIONAL: MY APPLICATIONS ───────────────────


class MyApplicationsView(generics.ListAPIView):
    serializer_class = ApplicationSerializer

    def get_queryset(self):
        return Application.objects.filter(
            applicant=self.request.user
        ).select_related("job__posted_by__ngo_profile", "applicant")


# ─── NGO: JOB MANAGEMENT ─────────────────────────────


class NgoJobCreateView(generics.CreateAPIView):
    serializer_class = JobCreateSerializer
    permission_classes = [IsNGOUser]

    def perform_create(self, serializer):
        serializer.save(posted_by=self.request.user)


class NgoJobsView(generics.ListAPIView):
    """NGO sees their own jobs."""
    serializer_class = JobListSerializer
    permission_classes = [IsNGOUser]

    def get_queryset(self):
        return Job.objects.filter(posted_by=self.request.user).annotate(
            applicant_count=Count("applications")
        ).select_related("posted_by__ngo_profile")


class NgoJobUpdateView(generics.UpdateAPIView):
    serializer_class = JobCreateSerializer
    permission_classes = [IsAdminOrNGOOwner]

    def get_queryset(self):
        if self.request.user.role == User.Roles.ADMIN:
            return Job.objects.all()
        return Job.objects.filter(posted_by=self.request.user)


class NgoJobDeleteView(generics.DestroyAPIView):
    permission_classes = [IsNGOUser]

    def get_queryset(self):
        return Job.objects.filter(posted_by=self.request.user)


class NgoStatsView(views.APIView):
    permission_classes = [IsNGOUser]

    def get(self, request, *args, **kwargs):
        user = request.user
        active_jobs = Job.objects.filter(posted_by=user, status__in=[Job.Status.OPEN, Job.Status.ACTIVE]).count()
        total_applicants = Application.objects.filter(job__posted_by=user).count()
        pending_reviews = Application.objects.filter(
            job__posted_by=user, status=Application.Status.PENDING
        ).count()
        interviews = Application.objects.filter(
            job__posted_by=user, status=Application.Status.INTERVIEW
        ).count()
        hired = Application.objects.filter(
            job__posted_by=user, status=Application.Status.HIRED
        ).count()

        return Response({
            "active_jobs": active_jobs,
            "total_applicants": total_applicants,
            "pending_reviews": pending_reviews,
            "interviews_scheduled": interviews,
            "hired": hired,
        })


# ─── NGO: APPLICATION MANAGEMENT ─────────────────────


class NgoApplicationsView(generics.ListAPIView):
    serializer_class = ApplicationSerializer
    permission_classes = [IsNGOUser | IsAdminUser]
    filterset_fields = ["status", "job"]

    def get_queryset(self):
        user = self.request.user
        if user.role == User.Roles.ADMIN:
            queryset = Application.objects.all()
        else:
            queryset = Application.objects.filter(job__posted_by=user)
        
        applicant_id = self.request.query_params.get("applicant")
        if applicant_id:
            queryset = queryset.filter(applicant_id=applicant_id)
            
        return queryset.select_related("job__posted_by__ngo_profile", "applicant")


class NgoApplicationDetailView(generics.RetrieveAPIView):
    serializer_class = ApplicationSerializer
    permission_classes = [IsNGOUser | IsAdminUser]

    def get_queryset(self):
        user = self.request.user
        if user.role == User.Roles.ADMIN:
            return Application.objects.all().select_related("job__posted_by__ngo_profile", "applicant")
        return Application.objects.filter(
            job__posted_by=user
        ).select_related("job__posted_by__ngo_profile", "applicant")



class NgoApproveApplicationView(views.APIView):
    """Approve application — supports shortlisted, interview, hired."""
    permission_classes = [IsNGOUser]

    def post(self, request, pk, *args, **kwargs):
        try:
            application = Application.objects.select_related("job", "applicant").get(
                pk=pk, job__posted_by=request.user
            )
        except Application.DoesNotExist:
            return Response({"detail": "Application not found."}, status=status.HTTP_404_NOT_FOUND)

        new_status = request.data.get("status", Application.Status.INTERVIEW).lower()
        
        # Map frontend statuses if they send display names
        status_map = {
            'shortlisted': Application.Status.SHORTLISTED,
            'interview': Application.Status.INTERVIEW,
            'hired': Application.Status.HIRED,
            'shortlist': Application.Status.SHORTLISTED,
        }
        
        application.status = status_map.get(new_status, Application.Status.INTERVIEW)
        
        if application.status == Application.Status.INTERVIEW:
            application.interview_details = {
                "date": request.data.get("date", ""),
                "time": request.data.get("time", ""),
                "platform": request.data.get("platform", ""),
                "location_or_link": request.data.get("location_or_link", ""),
                "message": request.data.get("message", ""),
            }
        
        application.save()
        return Response(ApplicationSerializer(application).data)


class NgoRejectApplicationView(views.APIView):
    """Reject application — sends notification with reason."""
    permission_classes = [IsNGOUser]

    def post(self, request, pk, *args, **kwargs):
        try:
            application = Application.objects.select_related("job", "applicant").get(
                pk=pk, job__posted_by=request.user
            )
        except Application.DoesNotExist:
            return Response({"detail": "Application not found."}, status=status.HTTP_404_NOT_FOUND)

        application.status = Application.Status.REJECTED
        application.rejection_category = request.data.get("rejection_category", "other")
        application.rejection_reason = request.data.get("message") or request.data.get("reason", "")
        application.save()

        return Response(ApplicationSerializer(application).data)


# ─── ADMIN: JOBS ─────────────────────────────────────


class AdminJobsView(generics.ListAPIView):
    serializer_class = JobListSerializer
    permission_classes = [IsAdminUser]

    def get_queryset(self):
        qs = Job.objects.annotate(
            applicant_count=Count("applications")
        ).select_related("posted_by__ngo_profile")
        
        user = self.request.user
        if user.is_authenticated:
            has_applied_subquery = Application.objects.filter(
                job=OuterRef('pk'), 
                applicant=user
            )
            qs = qs.annotate(has_applied=Exists(has_applied_subquery))
        else:
            qs = qs.annotate(has_applied=Value(False, output_field=BooleanField()))
            
        return qs


class AdminToggleJobView(views.APIView):
    permission_classes = [IsAdminUser]

    def post(self, request, pk, *args, **kwargs):
        try:
            job = Job.objects.get(pk=pk)
        except Job.DoesNotExist:
            return Response({"detail": "Job not found."}, status=status.HTTP_404_NOT_FOUND)

        if job.status in [Job.Status.OPEN, Job.Status.ACTIVE]:
            job.status = Job.Status.CLOSED
        else:
            job.status = Job.Status.OPEN
        job.save(update_fields=["status"])

        return Response({
            "id": job.id,
            "status": job.status,
            "is_active": job.status in [Job.Status.OPEN, Job.Status.ACTIVE],
        })


class AdminDeleteJobView(generics.DestroyAPIView):
    permission_classes = [IsAdminUser]
    queryset = Job.objects.all()
