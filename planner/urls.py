from django.urls import path
from .views import (
    GoalListCreateView,
    GoalDetailView,
    DailyPlanListCreateView,
    DailyPlanDetailView,
    ai_generate_plan
)

urlpatterns = [
    # Goals
    path('goals/', GoalListCreateView.as_view(), name='goals'),
    path('goals/<int:pk>/', GoalDetailView.as_view(), name='goal-detail'),

    # Daily Plans
    path('daily-plans/', DailyPlanListCreateView.as_view(), name='daily-plans'),
    path('daily-plans/<int:pk>/', DailyPlanDetailView.as_view(), name='dailyplan-detail'),

    # AI Generator
    path('ai/generate-plan/', ai_generate_plan, name='ai-generate-plan'),
]
