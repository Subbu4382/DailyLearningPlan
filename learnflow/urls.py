"""Project-level URL configuration.

All API endpoints from the `planner` app are grouped under `/api/`.
"""

from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('planner.urls')),  # All planner endpoints
]
