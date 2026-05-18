from rest_framework import generics, views, status
from rest_framework.response import Response

from .models import Notification
from .serializers import NotificationSerializer


class NotificationListView(generics.ListAPIView):
    serializer_class = NotificationSerializer

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user)


class MarkReadView(views.APIView):
    def patch(self, request, pk, *args, **kwargs):
        try:
            notification = Notification.objects.get(pk=pk, user=request.user)
        except Notification.DoesNotExist:
            return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)

        notification.is_read = True
        notification.save(update_fields=["is_read"])
        return Response(NotificationSerializer(notification).data)


class MarkAllReadView(views.APIView):
    def post(self, request, *args, **kwargs):
        count = Notification.objects.filter(user=request.user, is_read=False).update(is_read=True)
        return Response({"marked_read": count})


class UnreadCountView(views.APIView):
    def get(self, request, *args, **kwargs):
        count = Notification.objects.filter(user=request.user, is_read=False).count()
        return Response({"unread_count": count})
