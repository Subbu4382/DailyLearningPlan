"""Simple AI-like schedule generation helper.

For the hackathon demo we avoid heavy ML and keep it
algorithmic but deterministic and explainable:

Input:
    - topics: a list of topic strings
    - days: number of days to distribute these topics
    - hours_per_day: approximate study hours per day

Output:
    - A list of day-plans; each item is:
      {
          "day": 1,
          "topics": ["Topic A", "Topic B"],
          "planned_hours": 2
      }
"""

from math import ceil
from typing import List, Dict, Any


def generate_schedule(topics: List[str], days: int, hours_per_day: int = 2) -> List[Dict[str, Any]]:
    if days <= 0:
        raise ValueError("Days must be a positive integer.")
    # Remove empty strings / whitespace-only topics
    cleaned_topics = [t.strip() for t in topics if t.strip()]

    if not cleaned_topics:
        return []

    # Basic even distribution: split topics roughly equally per day
    topics_per_day = ceil(len(cleaned_topics) / days)
    schedule = []

    index = 0
    for day in range(1, days + 1):
        day_topics = cleaned_topics[index:index + topics_per_day]
        if not day_topics:
            break
        index += topics_per_day
        schedule.append(
            {
                "day": day,
                "topics": day_topics,
                "planned_hours": hours_per_day,
            }
        )

    return schedule
