from rest_framework import generics, permissions

from .models import Ticket
from .serializers import TicketSerializer, AdminTicketSerializer

class TicketListCreateView(generics.ListCreateAPIView):
    serializer_class = TicketSerializer

    def get_queryset(self):
        return Ticket.objects.filter(user=self.request.user).order_by("-created_at")

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class TicketDetailView(generics.RetrieveUpdateAPIView):
    serializer_class = TicketSerializer

    def get_queryset(self):
        return Ticket.objects.filter(user=self.request.user)

class AdminTicketListView(generics.ListAPIView):
    serializer_class = AdminTicketSerializer
    permission_classes = [permissions.IsAdminUser]

    def get_queryset(self):
        queryset = Ticket.objects.all().order_by("-created_at")
        status_filter = self.request.query_params.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        else:
            # By default, for admin dashboard/overview, show only active ones
            # unless explicitly asking for all
            if self.request.query_params.get('all') != 'true':
                queryset = queryset.filter(status__in=['open', 'in_progress'])
        return queryset

class AdminTicketDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Ticket.objects.all()
    serializer_class = AdminTicketSerializer
    permission_classes = [permissions.IsAdminUser]

    def perform_update(self, serializer):
        # Force status and response from request data to ensure they are saved
        status = self.request.data.get('status')
        response = self.request.data.get('response')
        
        # Save the serializer first to handle other fields
        instance = serializer.save()
        
        # Then explicitly update status/response if they were provided
        if status or response:
            if status:
                instance.status = status
            if response:
                instance.response = response
            instance.save()
