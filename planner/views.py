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
import os
from google import genai
from google.genai.errors import APIError
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .models import Goal

import environ
env=environ.Env()
environ.Env.read_env()


# @api_view(['POST'])
# def ai_generate_plan(request):
#     """
#     AI-powered study plan generator using Google Gemini (google-genai SDK).
#     User sends: goal_id, days
#     """

#     goal_id = request.data.get("goal_id")
#     days = request.data.get("days")

#     if not goal_id or not days:
#         return Response({"detail": "goal_id and days are required"}, status=400)

#     # Fetch the goal
#     try:
#         goal = Goal.objects.get(id=goal_id)
#     except Goal.DoesNotExist:
#         return Response({"detail": "Goal not found"}, status=404)

#     # Get title and topics from DB
#     title = goal.title
#     user_topic = goal.description

#     # Build the prompt
#     prompt = f"""
#     Generate a {days}-day study plan for learning {title}.
#     Main focus topic: {user_topic}.

#     Only output day-wise plan like:
#     Day 1: topic
#     Day 2: topic
#     ...
#     Day {days}: final task.

#     No paragraphs or explanations. Just the plan.
#     """

#     # Get API key (you can store directly or use environment variable)
#     # api_key = os.getenv("GEMINI_API_KEY")
#     api_key = env("GEMINI_API_KEY")

#     if not api_key:
#         return Response({"detail": "GEMINI_API_KEY not set in server environment"}, status=500)

#     try:
#         # Initialize Gemini client
#         client = genai.Client(api_key=api_key)

#         # Generate content using your stable model
#         result = client.models.generate_content(
#             model="gemini-2.5-flash",
#             contents=prompt,
#         )

#         # Extract result text
#         ai_text = result.text

#         return Response({"plan": ai_text})

#     except APIError as e:
#         return Response({"detail": f"Gemini API error: {e}"}, status=500)

#     except Exception as e:
#         return Response({"detail": f"Unexpected error: {str(e)}"}, status=500)



@csrf_exempt
def ai_generate_plan(request, goal_id):
    """
    Generates a study plan automatically using goal_id.
    No need to send days/title/topics from frontend.
    """

    if request.method != "POST":
        return JsonResponse({"error": "Only POST allowed"}, status=405)

    # Validate goal
    try:
        goal = Goal.objects.get(id=goal_id)
    except Goal.DoesNotExist:
        return JsonResponse({"error": "Goal not found"}, status=404)

    # Extract stored goal data
    title = goal.title
    topics = goal.topics
    days = goal.days or 5   # default fallback

    # GEMINI API KEY
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        return JsonResponse({"error": "Gemini API key missing"}, status=500)

    client = genai.Client(api_key=api_key)

    # AI Prompt
    prompt = f"""
    Create a {days}-day structured study plan.

    Title: {title}
    Topics: {topics}

    Format exactly like this:

    Day 1: Topic
    Day 2: Topic
    ...
    Day {days}: Final revision or project

    Do NOT give extra explanation.
    """

    try:
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt
        )

        plan_text = response.text.strip()
        return JsonResponse({"plan": plan_text}, status=200)

    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)



#----------------------------------------------------------------#
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
from .models import UserRegistration


@csrf_exempt
def register_user(request):
    if request.method != "POST":
        return JsonResponse({"error": "Only POST allowed"}, status=405)

    try:
        data = json.loads(request.body)
        name = data.get("name")
        email = data.get("email")
        password = data.get("password")

        if not name or not email or not password:
            return JsonResponse({"error": "All fields are required"}, status=400)

        # Check if email exists
        if UserRegistration.objects.filter(email=email).exists():
            return JsonResponse({"error": "Email already registered"}, status=400)

        # Create user
        user = UserRegistration.objects.create(
            name=name,
            email=email,
            password=password
        )

        return JsonResponse({
            "message": "User registered successfully",
            "user_id": user.id
        }, status=201)

    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)


#---------------------------------------------------------------------------#
import jwt
import datetime
SECRET_KEY = 'django-insecure-change-this-key-for-production'
@csrf_exempt
def login_user(request):
    if request.method != "POST":
        return JsonResponse({"error": "Only POST allowed"}, status=405)

    try:
        data = json.loads(request.body)
        email = data.get("email")
        password = data.get("password")

        if not email or not password:
            return JsonResponse({"error": "Email and password are required"}, status=400)

        # Check user
        try:
            user = UserRegistration.objects.get(email=email)
        except UserRegistration.DoesNotExist:
            return JsonResponse({"error": "Invalid email or password"}, status=400)

        # Compare raw password (NO HASHING)
        if user.password != password:
            return JsonResponse({"error": "Invalid email or password"}, status=400)

        # Generate JWT token
        payload = {
            "user_id": user.id,
            "email": user.email,
            "exp": datetime.datetime.utcnow() + datetime.timedelta(minutes=30),  # Token expires in 3 days
            "iat": datetime.datetime.utcnow()
        }

        token = jwt.encode(payload, SECRET_KEY, algorithm="HS256")

        # Create response
        response = JsonResponse({
            "message": "Login successful",
            "user_id": user.id,
            "name": user.name,
            "token": token  # also return token (optional)
        }, status=200)

        # Set token in HttpOnly cookie
        response.set_cookie(
            key="auth_token",
            value=token,
            httponly=True,
            secure=False,   # Set True for HTTPS
            samesite="Lax",
            max_age=1 * 60 * 60  # 3 days
        )

        return response

    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)
