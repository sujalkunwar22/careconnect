from django.urls import path

from . import views

urlpatterns = [
    path("tickets/", views.TicketListCreateView.as_view(), name="ticket-list"),
    path("tickets/<int:pk>/", views.TicketDetailView.as_view(), name="ticket-detail"),
    # Admin endpoints
    path("admin/tickets/", views.AdminTicketListView.as_view(), name="admin-ticket-list"),
    path("admin/tickets/<int:pk>/", views.AdminTicketDetailView.as_view(), name="admin-ticket-detail"),
]
