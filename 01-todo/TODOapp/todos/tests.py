from django.test import TestCase
from django.urls import reverse

# Create your tests here.
from datetime import date, timedelta

from .models import Todo


class TodoAppTests(TestCase):
    def setUp(self):
        self.today = date.today()
        self.future = self.today + timedelta(days=7)
        self.past = self.today - timedelta(days=7)

        self.todo = Todo.objects.create(
            title="Buy milk",
            due_date=self.future,
            is_resolved=False,
        )

    # -----------------------
    # List / Home
    # -----------------------
    def test_list_page_renders(self):
        resp = self.client.get(reverse("todo_list"))
        self.assertEqual(resp.status_code, 200)
        self.assertContains(resp, "Buy milk")

    def test_list_page_shows_empty_state(self):
        Todo.objects.all().delete()
        resp = self.client.get(reverse("todo_list"))
        self.assertEqual(resp.status_code, 200)
        self.assertContains(resp, "No TODOs")  # adjust if your empty text differs

    # -----------------------
    # Create
    # -----------------------
    def test_create_todo_title_only(self):
        resp = self.client.post(
            reverse("todo_create"),
            data={"title": "Read a book", "due_date": "", "is_resolved": False},
            follow=True,
        )
        self.assertEqual(resp.status_code, 200)
        self.assertTrue(Todo.objects.filter(title="Read a book").exists())

    def test_create_todo_with_due_date(self):
        resp = self.client.post(
            reverse("todo_create"),
            data={"title": "Pay bills", "due_date": self.future.isoformat(), "is_resolved": False},
            follow=True,
        )
        self.assertEqual(resp.status_code, 200)
        todo = Todo.objects.get(title="Pay bills")
        self.assertEqual(todo.due_date, self.future)
        self.assertFalse(todo.is_resolved)

    def test_create_todo_fails_without_title(self):
        resp = self.client.post(
            reverse("todo_create"),
            data={"title": "", "due_date": self.future.isoformat(), "is_resolved": False},
        )
        # Should re-render form with errors, not redirect
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(Todo.objects.count(), 1)  # only setUp todo exists

    # -----------------------
    # Edit
    # -----------------------
    def test_edit_todo_updates_title_and_due_date(self):
        resp = self.client.post(
            reverse("todo_edit", args=[self.todo.pk]),
            data={"title": "Buy oat milk", "due_date": self.past.isoformat(), "is_resolved": False},
            follow=True,
        )
        self.assertEqual(resp.status_code, 200)
        self.todo.refresh_from_db()
        self.assertEqual(self.todo.title, "Buy oat milk")
        self.assertEqual(self.todo.due_date, self.past)
        self.assertFalse(self.todo.is_resolved)

    def test_edit_todo_can_mark_resolved(self):
        resp = self.client.post(
            reverse("todo_edit", args=[self.todo.pk]),
            data={"title": self.todo.title, "due_date": self.future.isoformat(), "is_resolved": True},
            follow=True,
        )
        self.assertEqual(resp.status_code, 200)
        self.todo.refresh_from_db()
        self.assertTrue(self.todo.is_resolved)

    def test_edit_nonexistent_todo_returns_404(self):
        resp = self.client.get(reverse("todo_edit", args=[999999]))
        self.assertEqual(resp.status_code, 404)

    # -----------------------
    # Toggle resolved
    # -----------------------
    def test_toggle_resolved_flips_state(self):
        self.assertFalse(self.todo.is_resolved)

        resp = self.client.post(reverse("todo_toggle_resolved", args=[self.todo.pk]), follow=True)
        self.assertEqual(resp.status_code, 200)

        self.todo.refresh_from_db()
        self.assertTrue(self.todo.is_resolved)

        # Toggle back
        resp = self.client.post(reverse("todo_toggle_resolved", args=[self.todo.pk]), follow=True)
        self.assertEqual(resp.status_code, 200)
        self.todo.refresh_from_db()
        self.assertFalse(self.todo.is_resolved)

    def test_toggle_resolved_requires_post(self):
        # If you used @require_POST, GET should return 405
        resp = self.client.get(reverse("todo_toggle_resolved", args=[self.todo.pk]))
        self.assertEqual(resp.status_code, 405)

    def test_toggle_nonexistent_returns_404(self):
        resp = self.client.post(reverse("todo_toggle_resolved", args=[999999]))
        self.assertEqual(resp.status_code, 404)

    # -----------------------
    # Delete
    # -----------------------
    def test_delete_confirm_page_renders(self):
        resp = self.client.get(reverse("todo_delete", args=[self.todo.pk]))
        self.assertEqual(resp.status_code, 200)
        self.assertContains(resp, "Delete")  # adjust if your confirm text differs

    def test_delete_todo_via_post(self):
        resp = self.client.post(reverse("todo_delete", args=[self.todo.pk]), follow=True)
        self.assertEqual(resp.status_code, 200)
        self.assertFalse(Todo.objects.filter(pk=self.todo.pk).exists())

    def test_delete_nonexistent_returns_404(self):
        resp = self.client.post(reverse("todo_delete", args=[999999]))
        self.assertEqual(resp.status_code, 404)

    # -----------------------
    # Due date edge cases
    # -----------------------
    def test_due_date_can_be_blank(self):
        resp = self.client.post(
            reverse("todo_edit", args=[self.todo.pk]),
            data={"title": self.todo.title, "due_date": "", "is_resolved": False},
            follow=True,
        )
        self.assertEqual(resp.status_code, 200)
        self.todo.refresh_from_db()
        self.assertIsNone(self.todo.due_date)

    def test_past_due_date_is_allowed(self):
        resp = self.client.post(
            reverse("todo_edit", args=[self.todo.pk]),
            data={"title": self.todo.title, "due_date": self.past.isoformat(), "is_resolved": False},
            follow=True,
        )
        self.assertEqual(resp.status_code, 200)
        self.todo.refresh_from_db()
        self.assertEqual(self.todo.due_date, self.past)