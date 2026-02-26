from django.contrib import admin
from .models import Todo

admin.site.register(Todo)
class TodoAdmin(admin.ModelAdmin):
    list_display = ("title", "due_date", "is_resolved", "created_at")
    list_filter = ("is_resolved","is_overdue")
    search_fields = ("title")