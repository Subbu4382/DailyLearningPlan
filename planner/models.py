# """Database models for the learning planner.

# The core idea:
# - Goal: a higher-level learning target (e.g., "Complete Python Basics").
# - DailyPlan: specific tasks scheduled for a particular day, optionally
#   linked to a Goal.
# """

# from django.db import models
# from .models import UserRegistration

# class Goal(models.Model):
#     """Represents a learning goal set by the student."""

#     title = models.CharField(max_length=200)
#     description = models.TextField(blank=True)
#     deadline = models.DateField()
#     total_hours = models.PositiveIntegerField(
#         default=0,
#         help_text="Estimated total hours needed for this goal."
#     )
#     is_completed = models.BooleanField(default=False)
#     created_at = models.DateTimeField(auto_now_add=True)
#     updated_at = models.DateTimeField(auto_now=True)

#     def __str__(self) -> str:
#         return self.title


#     @property
#     def status(self) -> str:
#         """Returns a simple human-readable status string."""
#         return "Completed" if self.is_completed else "In Progress"


# class DailyPlan(models.Model):
#     """Represents a day-wise learning schedule.

#     Example:
#     - date: 2025-12-01
#     - topics: "Lists, Tuples, Set basics"
#     - goal: Link to the Python Basics Goal
#     """
  
#     goal = models.ForeignKey(
#         Goal,
#         on_delete=models.CASCADE,
#         related_name='daily_plans',
#         null=True,
#         blank=True,
#         help_text="Optional link to a broader learning goal."
#     )
#     date = models.DateField()
#     topics = models.TextField(
#         help_text="Comma-separated or free-text list of topics planned."
#     )
#     planned_hours = models.PositiveIntegerField(
#         default=1,
#         help_text="Planned number of study hours for this day."
#     )
#     is_completed = models.BooleanField(default=False)
#     created_at = models.DateTimeField(auto_now_add=True)
#     updated_at = models.DateTimeField(auto_now=True)

#     def __str__(self) -> str:
#         return f"Plan for {self.date} ({'Done' if self.is_completed else 'Pending'})"



# from django.contrib.auth.hashers import make_password

# class UserRegistration(models.Model):
#     name = models.CharField(max_length=100)
#     email = models.EmailField(unique=True)
#     password = models.CharField(max_length=255)   # hashed password stored

#     created_at = models.DateTimeField(auto_now_add=True)

#     # Automatically hash password before saving
#     # def save(self, *args, **kwargs):
#     #     if not self.pk:  # only hash when creating user
#     #         self.password = make_password(self.password)
#     #     super().save(*args, **kwargs)

#     # def __str__(self):
#     #     return self.email




#------------------------------------------------
#-----------------------------------------------


from django.db import models
from django.contrib.auth.hashers import make_password


class UserRegistration(models.Model):
    name = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    password = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.email


class Goal(models.Model):
    user = models.ForeignKey(
        UserRegistration, 
        on_delete=models.CASCADE,
        related_name="goals"
    )
    title = models.CharField(max_length=200,unique=True)
    description = models.TextField(blank=True)
    deadline = models.DateField()
    total_hours = models.PositiveIntegerField(default=0)
    is_completed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    @property
    def status(self):
        return "Completed" if self.is_completed else "In Progress"

    def __str__(self):
        return self.title


class DailyPlan(models.Model):
    user = models.ForeignKey(
        UserRegistration,
        on_delete=models.CASCADE,
        related_name="daily_plans"
    )
    goal = models.ForeignKey(
        Goal,
        on_delete=models.CASCADE,
        related_name='daily_plans',
        null=True,
        blank=True
    )
    date = models.DateField()
    topics = models.TextField()
    planned_hours = models.PositiveIntegerField(default=1)
    is_completed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Plan for {self.date}"
