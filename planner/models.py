




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
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    deadline = models.DateField()
    total_hours = models.PositiveIntegerField(default=0)
    is_completed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ("user", "title")

    def save(self, *args, **kwargs):
        self.title = self.title.lower().strip()
        super().save(*args, **kwargs)

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
