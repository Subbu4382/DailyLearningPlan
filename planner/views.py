"""Clean and simple API views for the learning planner backend."""

from datetime import date

from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import api_view
from django.views.decorators.csrf import csrf_exempt

from .models import Goal, DailyPlan
from .serializers import GoalSerializer, DailyPlanSerializer
from .ai_service import generate_schedule


# ---------------------------------------------------------
# GOAL CRUD
# ---------------------------------------------------------

class GoalListCreateView(APIView):
    def get(self, request):
        user = get_logged_in_user(request)
        if not user:
            return Response({"detail": "Unauthorized"}, status=401)

        goals = Goal.objects.filter(user=user).order_by('-created_at')
        serializer = GoalSerializer(goals, many=True)
        return Response(serializer.data)

    def post(self, request):
        user = get_logged_in_user(request)
        if not user:
            return Response({"detail": "Unauthorized"}, status=401)

        data = request.data.copy()
        data["user"] = user.id

        serializer = GoalSerializer(data=data)
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
      user = get_logged_in_user(request)
      if not user:
          return Response({"detail": "Unauthorized"}, status=401)

      plans = DailyPlan.objects.filter(user=user).order_by("date")
      serializer = DailyPlanSerializer(plans, many=True)
      return Response(serializer.data)

    def post(self, request):
        user = get_logged_in_user(request)
        if not user:
            return Response({"detail": "Unauthorized"}, status=401)

        data = request.data.copy()
        data["user"] = user.id

        serializer = DailyPlanSerializer(data=data)
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


@api_view(['POST'])
def ai_generate_plan(request):
    """
    AI-powered study plan generator using Google Gemini (google-genai SDK).
    User sends: goal_id, days
    """
    user = get_logged_in_user(request)
    if not user:
       return Response({"detail": "Unauthorized"}, status=401)
    goal_id = request.data.get("goal_id")
    days = request.data.get("days")

    if not goal_id or not days:
        return Response({"detail": "goal_id and days are required"}, status=400)

    # Fetch the goal
    try:
       goal = Goal.objects.get(id=goal_id, user=user)
    except Goal.DoesNotExist:
        return Response({"detail": "Goal not found"}, status=404)

    # Get title and topics from DB
    title = goal.title
    user_topic = goal.description

    # Build the prompt
    # prompt = f"""
    # Generate a {days}-day study plan for learning {title}.
    # Main focus topic: {user_topic}.

    # Only output day-wise plan like:
    # Day 1: topic
    # Day 2: topic
    # ...
    # Day {days}: final task.

    # No paragraphs or explanations. Just the plan.
    # """

    prompt = f"""
Generate a study plan for the goal: {title}.
Main topic: {user_topic}.

Create exactly {days} day(s) of plan.

Output format:
Day 1: topic
Day 2: topic
...
Day {days}: topic

Rules:
- If {days} = 1, output ONLY: "Day 1: topic"
- Do NOT repeat the same day multiple times
- Do NOT include explanations or paragraphs
- Output only the plan
"""


    # Get API key (you can store directly or use environment variable)
    # api_key = os.getenv("GEMINI_API_KEY")
    api_key = env("GEMINI_API_KEY")

    if not api_key:
        return Response({"detail": "GEMINI_API_KEY not set in server environment"}, status=500)

    try:
        # Initialize Gemini client
        client = genai.Client(api_key=api_key)

        # Generate content using your stable model
        result = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt,
        )

        # Extract result text
        ai_text = result.text

        return Response({"plan": ai_text})

    except APIError as e:
        return Response({"detail": f"Gemini API error: {e}"}, status=500)

    except Exception as e:
        return Response({"detail": f"Unexpected error: {str(e)}"}, status=500)



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
        secure=True,      # MUST be True for HTTPS
        samesite="None",  # MUST be None for cross-domain
        max_age=3*24 * 60 * 60
)

        return response

    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)


# 222
import jwt
from django.http import JsonResponse

def get_logged_in_user(request):
    token = request.COOKIES.get("auth_token")
    if not token:
        return None
    
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        return UserRegistration.objects.get(id=payload["user_id"])
    except:
        return None
