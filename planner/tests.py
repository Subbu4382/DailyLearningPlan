"""Basic tests to ensure the core API endpoints work.

In a hackathon you may not have time for full coverage, but even a few
tests show professionalism and help prevent regressions.
"""

from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status

from .models import Goal


class GoalApiTests(APITestCase):
    def test_create_goal(self):
        url = reverse('goal-list')
        payload = {
            "title": "Learn Django",
            "description": "Finish basic CRUD and REST API",
            "deadline": "2025-12-31",
            "total_hours": 20
        }
        response = self.client.post(url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Goal.objects.count(), 1)


    def test_ai_generate_plan(self):
        url = reverse('ai-generate-plan')
        payload = {
            "topics": "lists, tuples, sets, dicts",
            "days": 2,
            "hours_per_day": 2,
            "start_date": "2025-12-01"
        }
        response = self.client.post(url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(len(response.data) >= 1)
