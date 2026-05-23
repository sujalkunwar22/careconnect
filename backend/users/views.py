from __future__ import annotations

from django.db.models import Count, Q
from django.utils import timezone
from rest_framework import generics, permissions, status, views
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken

from .models import KYCDocument, OTP, User
from .permissions import IsAdminUser
from jobs.models import Job
from .serializers import (
    AdminUserSerializer,
    ChangePasswordSerializer,
    KYCDocumentSerializer,
    KYCSubmitSerializer,
    LoginSerializer,
    OTPSerializer,
    RegistrationSerializer,
    UserSerializer,
)


# ─── AUTH ──────────────────────────────────────────────


class RegisterView(generics.CreateAPIView):
    serializer_class = RegistrationSerializer
    permission_classes = [permissions.AllowAny]

    def post(self, request, *args, **kwargs):
        print(f"DEBUG: Registration attempt with data: {request.data}")
        return super().post(request, *args, **kwargs)


class LoginView(views.APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request, *args, **kwargs):
        print(f"DEBUG: Login attempt with data: {request.data}")
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data["user"]
        refresh = RefreshToken.for_user(user)
        return Response({
            "access": str(refresh.access_token),
            "refresh": str(refresh),
            "user": UserSerializer(user).data,
        })


class RefreshTokenView(views.APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request, *args, **kwargs):
        refresh_token = request.data.get("refresh")
        if not refresh_token:
            return Response({"detail": "Refresh token required."}, status=status.HTTP_400_BAD_REQUEST)
        try:
            refresh = RefreshToken(refresh_token)
            return Response({"access": str(refresh.access_token)})
        except Exception:
            return Response({"detail": "Invalid refresh token."}, status=status.HTTP_401_UNAUTHORIZED)


class LogoutView(views.APIView):
    def post(self, request, *args, **kwargs):
        refresh_token = request.data.get("refresh")
        if refresh_token:
            try:
                token = RefreshToken(refresh_token)
                token.blacklist()
            except Exception:
                pass
        return Response(status=status.HTTP_204_NO_CONTENT)


# ─── PROFILE ──────────────────────────────────────────


class ProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer

    def get_object(self):
        return self.request.user

    def update(self, request, *args, **kwargs):
        print(f"DEBUG: Profile Update Attempt - Data: {request.data}")
        
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        if not serializer.is_valid():
            print(f"DEBUG: Profile serializer validation errors: {serializer.errors}")
        return super().update(request, *args, **kwargs)


class ChangePasswordView(views.APIView):
    def post(self, request, *args, **kwargs):
        serializer = ChangePasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = request.user
        if not user.check_password(serializer.validated_data["old_password"]):
            return Response(
                {"old_password": "Wrong password."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user.set_password(serializer.validated_data["new_password"])
        user.save()
        return Response({"detail": "Password updated."})


# ─── KYC ──────────────────────────────────────────────


class KYCSubmitView(generics.CreateAPIView):
    serializer_class = KYCSubmitSerializer

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class KYCStatusView(generics.ListAPIView):
    serializer_class = KYCDocumentSerializer

    def get_queryset(self):
        return KYCDocument.objects.filter(user=self.request.user)


# ─── ADMIN: USERS ────────────────────────────────────


class AdminUserListView(generics.ListAPIView):
    serializer_class = AdminUserSerializer
    permission_classes = [IsAdminUser]
    filterset_fields = ["role", "is_kyc_verified", "is_active"]
    search_fields = ["full_name", "email", "phone_number", "username"]

    def get_queryset(self):
        return User.objects.all().order_by("-date_joined")


class AdminUserUpdateView(generics.RetrieveUpdateAPIView):
    serializer_class = AdminUserSerializer
    permission_classes = [IsAdminUser]
    queryset = User.objects.all()



class AdminUserDeleteView(generics.DestroyAPIView):
    permission_classes = [IsAdminUser]
    queryset = User.objects.all()

    def perform_destroy(self, instance):
        if instance.role == User.Roles.ADMIN or instance.is_superuser:
            from rest_framework.exceptions import ValidationError
            raise ValidationError({"detail": "Admin users cannot be deleted for security reasons."})
        super().perform_destroy(instance)


class AdminToggleUserStatusView(views.APIView):
    permission_classes = [IsAdminUser]

    def post(self, request, pk, *args, **kwargs):
        try:
            user = User.objects.get(pk=pk)
        except User.DoesNotExist:
            return Response({"detail": "User not found."}, status=status.HTTP_404_NOT_FOUND)

        user.is_active = not user.is_active
        user.save(update_fields=["is_active"])
        return Response({
            "id": user.id,
            "is_active": user.is_active,
            "detail": f"User {'activated' if user.is_active else 'deactivated'}.",
        })


class AdminStatsView(views.APIView):
    permission_classes = [IsAdminUser]

    def get(self, request, *args, **kwargs):
        from jobs.models import Job, Application
        from datetime import timedelta

        total_users = User.objects.filter(role=User.Roles.USER).count()
        total_ngos = User.objects.filter(role=User.Roles.NGO).count()
        active_jobs = Job.objects.filter(status__in=[Job.Status.OPEN, Job.Status.ACTIVE]).count()
        pending_kyc = KYCDocument.objects.filter(status=KYCDocument.Status.PENDING).count()
        total_applications = Application.objects.count()

        # Count of KYC documents verified today
        today_start = timezone.now().replace(hour=0, minute=0, second=0, microsecond=0)
        verified_today_count = KYCDocument.objects.filter(status=KYCDocument.Status.VERIFIED, reviewed_at__gte=today_start).count()

        # Registration stats for last 6 months
        now = timezone.now()
        monthly_registrations = []
        for i in range(5, -1, -1):
            month_start = (now - timedelta(days=30 * i)).replace(day=1, hour=0, minute=0, second=0)
            if i > 0:
                month_end = (now - timedelta(days=30 * (i - 1))).replace(day=1, hour=0, minute=0, second=0)
            else:
                month_end = now
            count = User.objects.filter(date_joined__gte=month_start, date_joined__lt=month_end).count()
            monthly_registrations.append({
                "month": month_start.strftime("%b %Y"),
                "count": count,
            })

        # Recent activity feed
        recent_kyc = KYCDocument.objects.filter(reviewed_at__isnull=False).select_related("user").order_by("-reviewed_at")[:50]
        recent_jobs = Job.objects.order_by("-updated_at")[:50]
        recent_users = User.objects.order_by("-date_joined")[:50]
        
        from support.models import Ticket
        recent_tickets = Ticket.objects.order_by("-updated_at")[:50]

        recent_activity = []

        for kyc in recent_kyc:
            user_name = kyc.user.full_name or kyc.user.username or kyc.user.email or f"User {kyc.user_id}"
            if kyc.status == KYCDocument.Status.VERIFIED:
                title = "KYC approved"
                desc = f"{user_name} was verified by admin."
                activity_type = "kyc_approved"
            elif kyc.status == KYCDocument.Status.REJECTED:
                title = "KYC rejected"
                desc = f"{user_name}'s verification was rejected."
                activity_type = "kyc_rejected"
            elif kyc.status == KYCDocument.Status.INFO_REQUESTED:
                title = "KYC info requested"
                desc = f"More information was requested from {user_name}."
                activity_type = "kyc_info_requested"
            else:
                continue

            recent_activity.append({
                "id": f"kyc-{kyc.id}",
                "type": activity_type,
                "title": title,
                "desc": desc,
                "timestamp": kyc.reviewed_at.isoformat(),
            })

        for job in recent_jobs:
            if job.created_at == job.updated_at:
                title = "Job posted"
                activity_type = "job_posted"
                desc = f"New job '{job.title}' was added."
                timestamp = job.created_at
            else:
                title = "Job updated"
                activity_type = "job_updated"
                status_label = job.get_status_display()
                desc = f"Job '{job.title}' was updated (status: {status_label})."
                timestamp = job.updated_at

            recent_activity.append({
                "id": f"job-{job.id}-{int(timestamp.timestamp())}",
                "type": activity_type,
                "title": title,
                "desc": desc,
                "timestamp": timestamp.isoformat(),
            })

        for user in recent_users:
            recent_activity.append({
                "id": f"user-{user.id}",
                "type": "user_registered",
                "title": "User registered",
                "desc": f"{user.full_name or user.username} joined the platform.",
                "timestamp": user.date_joined.isoformat(),
            })

        for ticket in recent_tickets:
            user_name = ticket.user.full_name or ticket.user.username or "Anonymous"
            if ticket.status == Ticket.Status.RESOLVED:
                title = "Issue resolved"
                desc = f"Support ticket '{ticket.subject}' from {user_name} was marked as resolved."
                activity_type = "ticket_resolved"
            elif ticket.created_at == ticket.updated_at:
                title = "New issue reported"
                desc = f"{user_name} submitted a new support ticket: '{ticket.subject}'"
                activity_type = "ticket_created"
            else:
                continue

            recent_activity.append({
                "id": f"ticket-{ticket.id}",
                "type": activity_type,
                "title": title,
                "desc": desc,
                "timestamp": ticket.updated_at.isoformat(),
            })

        recent_activity = sorted(recent_activity, key=lambda item: item["timestamp"], reverse=True)[:7]

        return Response({
            "total_users": total_users,
            "total_ngos": total_ngos,
            "active_jobs": active_jobs,
            "pending_kyc": pending_kyc,
            "total_applications": total_applications,
            "monthly_registrations": monthly_registrations,
            "recent_activity": recent_activity,
            # Additional keys for verifier and other dashboards
            "total_caregivers": total_users,
            "pending_kyc_count": pending_kyc,
            "verified_today_count": verified_today_count,
        })


# ─── ADMIN: KYC ──────────────────────────────────────


class AdminKYCListView(generics.ListAPIView):
    serializer_class = KYCDocumentSerializer
    permission_classes = [IsAdminUser]
    filterset_fields = ["status"]

    def get_queryset(self):
        return KYCDocument.objects.select_related("user").all()


class AdminKYCDetailView(generics.RetrieveAPIView):
    serializer_class = KYCDocumentSerializer
    permission_classes = [IsAdminUser]
    queryset = KYCDocument.objects.select_related("user")


class AdminKYCApproveView(views.APIView):
    permission_classes = [IsAdminUser]

    def post(self, request, pk, *args, **kwargs):
        try:
            kyc = KYCDocument.objects.select_related("user").get(pk=pk)
        except KYCDocument.DoesNotExist:
            return Response({"detail": "KYC not found."}, status=status.HTTP_404_NOT_FOUND)

        kyc.status = KYCDocument.Status.VERIFIED
        kyc.reviewed_at = timezone.now()
        kyc.reviewed_by = request.user
        kyc.save()

        kyc.user.is_kyc_verified = True
        kyc.user.save(update_fields=["is_kyc_verified"])

        return Response(KYCDocumentSerializer(kyc).data)


class AdminKYCRejectView(views.APIView):
    permission_classes = [IsAdminUser]

    def post(self, request, pk, *args, **kwargs):
        try:
            kyc = KYCDocument.objects.select_related("user").get(pk=pk)
        except KYCDocument.DoesNotExist:
            return Response({"detail": "KYC not found."}, status=status.HTTP_404_NOT_FOUND)

        rejection_reason = request.data.get("rejection_reason", "")
        if not rejection_reason:
            return Response(
                {"detail": "Rejection reason is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        kyc.status = KYCDocument.Status.REJECTED
        kyc.rejection_reason = rejection_reason
        kyc.reviewed_at = timezone.now()
        kyc.reviewed_by = request.user
        kyc.save()

        return Response(KYCDocumentSerializer(kyc).data)


class AdminKYCRequestInfoView(views.APIView):
    permission_classes = [IsAdminUser]

    def post(self, request, pk, *args, **kwargs):
        try:
            kyc = KYCDocument.objects.select_related("user").get(pk=pk)
        except KYCDocument.DoesNotExist:
            return Response({"detail": "KYC not found."}, status=status.HTTP_404_NOT_FOUND)

        admin_notes = request.data.get("admin_notes", "")
        if not admin_notes:
            return Response(
                {"detail": "Admin notes are required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        kyc.status = KYCDocument.Status.INFO_REQUESTED
        kyc.admin_notes = admin_notes
        kyc.reviewed_at = timezone.now()
        kyc.reviewed_by = request.user
        kyc.save()

        return Response(KYCDocumentSerializer(kyc).data)


# ─── OTP ──────────────────────────────────────────────


class OTPRequestView(generics.CreateAPIView):
    serializer_class = OTPSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        import os
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        bypass_twilio = os.getenv("BYPASS_TWILIO", "False") == "True"
        bypass_email = os.getenv("BYPASS_EMAIL", "False") == "True"
        response_data = {
            **serializer.data,
            "bypass_twilio": bypass_twilio,
            "bypass_email": bypass_email,
            "bypass": bypass_twilio
        }
        return Response(response_data, status=status.HTTP_201_CREATED, headers=headers)

    def perform_create(self, serializer):
        import random
        import os
        phone_number = serializer.validated_data["phone_number"]
        email = self.request.data.get("email")
        code = str(random.randint(100000, 999999))
        OTP.objects.filter(phone_number=phone_number, is_used=False).update(is_used=True)
        serializer.save(code=code)
        
        bypass_twilio = os.getenv("BYPASS_TWILIO", "False") == "True"
        
        # Send SMS via Twilio
        try:
            from twilio.rest import Client
            account_sid = os.getenv("TWILIO_ACCOUNT_SID")
            auth_token = os.getenv("TWILIO_AUTH_TOKEN")
            from_number = os.getenv("TWILIO_PHONE_NUMBER")
            
            if account_sid and auth_token and from_number and not bypass_twilio:
                client = Client(account_sid, auth_token)
                # Ensure the phone number starts with + and has country code
                to_number = phone_number
                if not to_number.startswith("+"):
                    # Prepend Nepal code (+977) if 10-digit number starting with 9
                    if len(to_number) == 10 and to_number.startswith("9"):
                        to_number = "+977" + to_number
                    else:
                        to_number = "+" + to_number
                
                message = client.messages.create(
                    body=f"Your CareConnect verification code is: {code}",
                    from_=from_number,
                    to=to_number
                )
                print(f"[Twilio] Sent SMS SID: {message.sid} to {to_number}")
            else:
                print(f"[Twilio] SMS sending skipped. Configured: {bool(account_sid and auth_token and from_number)}, Bypass: {bypass_twilio}")
        except Exception as e:
            print(f"[Twilio Error] Failed to send SMS: {e}")
            
        # Send Email via Django send_mail (Gmail SMTP)
        bypass_email = os.getenv("BYPASS_EMAIL", "False") == "True"
        if email and not bypass_email:
            try:
                from django.core.mail import send_mail
                send_mail(
                    subject="CareConnect Verification Code",
                    message=f"Your CareConnect OTP verification code is: {code}. Please use this code to complete your registration.",
                    from_email=None,
                    recipient_list=[email],
                    fail_silently=False,
                )
                print(f"[SMTP] Successfully sent OTP email to {email}")
            except Exception as e:
                print(f"[SMTP Error] Failed to send email to {email}: {e}")
        else:
            print(f"[SMTP] Email sending skipped. Recipient: {email}, Bypass: {bypass_email}")
        
        # For development fallback
        print(f"[DEV] OTP for {phone_number}: {code}")


class OTPVerifyView(views.APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request, *args, **kwargs):
        phone_number = request.data.get("phone_number")
        code = request.data.get("code")
        try:
            otp = OTP.objects.get(phone_number=phone_number, code=code, is_used=False)
        except OTP.DoesNotExist:
            return Response({"detail": "Invalid OTP."}, status=status.HTTP_400_BAD_REQUEST)
        otp.is_used = True
        otp.save(update_fields=["is_used"])
        return Response({"detail": "OTP verified."})
