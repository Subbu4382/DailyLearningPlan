"""Admin registrations for quick data inspection in Django admin."""

from django.contrib import admin
from .models import Goal, DailyPlan


@admin.register(Goal)
class GoalAdmin(admin.ModelAdmin):
    list_display = ('title', 'deadline', 'is_completed', 'created_at')
    list_filter = ('is_completed', 'deadline')
    search_fields = ('title',)


@admin.register(DailyPlan)
class DailyPlanAdmin(admin.ModelAdmin):
    list_display = ('date', 'goal', 'planned_hours', 'is_completed')
    list_filter = ('is_completed', 'date')
    search_fields = ('topics',)
