from django.db import models
from django.utils import timezone


class Todo(models.Model):
    
    title = models.CharField(max_length=200)
    due_date = models.DateField(null=True, blank=True)
    is_resolved = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        
        ordering = ["is_resolved", "due_date", "-created_at"]

    def is_overdue(self) -> bool:
        # Overdue only if it has a due date, it's in the past, and not resolved
        if self.due_date is None:
            return False
        return (not self.is_resolved) and (self.due_date < timezone.localdate())

    def __str__(self):
        return self.title