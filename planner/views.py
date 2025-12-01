"""Clean and simple API views for the learning planner backend."""

from datetime import date

from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import api_view

from .models import Goal, DailyPlan
from .serializers import GoalSerializer, DailyPlanSerializer
from .ai_service import generate_schedule


# ---------------------------------------------------------
# GOAL CRUD
# ---------------------------------------------------------

class GoalListCreateView(APIView):
    """GET -> List all goals
       POST -> Create new goal
    """

    def get(self, request):
        goals = Goal.objects.all().order_by('-created_at')
        serializer = GoalSerializer(goals, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = GoalSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)


class GoalDetailView(APIView):
    """GET -> Retrieve single goal
       PUT -> Update goal fully
       PATCH -> Partial update
       DELETE -> Delete goal
    """

    def get_object(self, pk):
        try:
            return Goal.objects.get(pk=pk)
        except Goal.DoesNotExist:
            return None

    def get(self, request, pk):
        goal = self.get_object(pk)
        if not goal:
            return Response({"detail": "Goal not found"}, status=404)
        serializer = GoalSerializer(goal)
        return Response(serializer.data)

    def put(self, request, pk):
        goal = self.get_object(pk)
        if not goal:
            return Response({"detail": "Goal not found"}, status=404)
        serializer = GoalSerializer(goal, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)

    def patch(self, request, pk):
        goal = self.get_object(pk)
        if not goal:
            return Response({"detail": "Goal not found"}, status=404)
        serializer = GoalSerializer(goal, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)

    def delete(self, request, pk):
        goal = self.get_object(pk)
        if not goal:
            return Response({"detail": "Goal not found"}, status=404)
        goal.delete()
        return Response(status=204)


# ---------------------------------------------------------
# DAILY PLAN CRUD
# ---------------------------------------------------------

class DailyPlanListCreateView(APIView):
    """GET -> List daily plans (with optional date filters)
       POST -> Create new daily plan
    """

    def get(self, request):
        qs = DailyPlan.objects.all().order_by('date')

        # Optional date filters
        start = request.query_params.get('from')
        end = request.query_params.get('to')

        if start:
            qs = qs.filter(date__gte=start)
        if end:
            qs = qs.filter(date__lte=end)

        serializer = DailyPlanSerializer(qs, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = DailyPlanSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)


class DailyPlanDetailView(APIView):
    """GET -> Retrieve daily plan
       PUT -> Update
       PATCH -> Partial update
       DELETE -> Delete
    """

    def get_object(self, pk):
        try:
            return DailyPlan.objects.get(pk=pk)
        except DailyPlan.DoesNotExist:
            return None

    def get(self, request, pk):
        plan = self.get_object(pk)
        if not plan:
            return Response({"detail": "Daily plan not found"}, status=404)
        serializer = DailyPlanSerializer(plan)
        return Response(serializer.data)

    def put(self, request, pk):
        plan = self.get_object(pk)
        if not plan:
            return Response({"detail": "Daily plan not found"}, status=404)
        serializer = DailyPlanSerializer(plan, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)

    def patch(self, request, pk):
        plan = self.get_object(pk)
        if not plan:
            return Response({"detail": "Daily plan not found"}, status=404)
        serializer = DailyPlanSerializer(plan, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)

    def delete(self, request, pk):
        plan = self.get_object(pk)
        if not plan:
            return Response({"detail": "Daily plan not found"}, status=404)
        plan.delete()
        return Response(status=204)


# ---------------------------------------------------------
# AI PLAN GENERATOR
# ---------------------------------------------------------

@api_view(['POST'])
def ai_generate_plan(request):
    """AI auto-distributes topics over given days."""

    topics_raw = request.data.get('topics')
    days = int(request.data.get('days', 0))
    hours_per_day = int(request.data.get('hours_per_day', 2))
    start_date_str = request.data.get('start_date')

    if not topics_raw:
        return Response({"detail": "'topics' is required"}, status=400)

    # Accept comma string or list
    if isinstance(topics_raw, str):
        topics = topics_raw.split(',')
    elif isinstance(topics_raw, list):
        topics = topics_raw
    else:
        return Response({"detail": "'topics' must be string or list"}, status=400)

    if days <= 0:
        return Response({"detail": "'days' must be positive"}, status=400)

    schedule = generate_schedule(topics, days, hours_per_day)

    # date handling
    if start_date_str:
        try:
            y, m, d = map(int, start_date_str.split('-'))
            start = date(y, m, d)
        except:
            return Response({"detail": "Invalid date format YYYY-MM-DD"}, status=400)
    else:
        start = date.today()

    result = []
    for entry in schedule:
        actual = date.fromordinal(start.toordinal() + entry["day"] - 1)
        result.append({
            "day": entry["day"],
            "date": actual.isoformat(),
            "topics": entry["topics"],
            "planned_hours": entry["planned_hours"],
        })

    return Response(result)
