"""Serializers convert model instances to/from JSON for the API."""

from rest_framework import serializers
from .models import Goal, DailyPlan


class GoalSerializer(serializers.ModelSerializer):
    """Serializer for the Goal model."""

    class Meta:
        model = Goal
        fields = [
            'id',
            'user',
            'title',
            'description',
            'deadline',
            'total_hours',
            'is_completed',
            'status',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['status', 'created_at', 'updated_at']


class DailyPlanSerializer(serializers.ModelSerializer):
    """Serializer for the DailyPlan model."""

    goal_title = serializers.CharField(
        source='goal.title',
        read_only=True,
        help_text="Convenience field to show the goal name directly."
    )

    class Meta:
        model = DailyPlan
        fields = [
            'id',
            'user',
            'goal',
            'goal_title',
            'date',
            'topics',
            'planned_hours',
            'is_completed',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['created_at', 'updated_at']
