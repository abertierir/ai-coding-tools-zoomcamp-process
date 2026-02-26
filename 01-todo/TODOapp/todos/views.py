from django.shortcuts import render

from django.shortcuts import render, get_object_or_404, redirect
from django.views.decorators.http import require_POST
from django.db.models import Q
from .models import Todo
from .forms import TodoForm

def todo_list(request):
    """
    Lists TODOs. Supports:
    - filter: ?status=open|resolved|all
    - search: ?q=some text
    """
    status = request.GET.get("status", "all")
    q = request.GET.get("q", "").strip()

    todos = Todo.objects.all()

    if status == "open":
        todos = todos.filter(is_resolved=False)
    elif status == "resolved":
        todos = todos.filter(is_resolved=True)

    if q:
        todos = todos.filter(Q(title__icontains=q))

    # Nice ordering: open first, then due date, then newest
    todos = todos.order_by("is_resolved", "due_date", "-created_at")

    return render(request, "todos/home.html", {"todos": todos, "status": status, "q": q})

def todo_create(request):
    if request.method == "POST":
        form = TodoForm(request.POST)
        if form.is_valid():
            form.save()
            return redirect("todo_list")
    else:
        form = TodoForm()

    return render(request, "todos/todo_form.html", {"form": form, "mode": "Create"})

def todo_edit(request, pk: int):
    todo = get_object_or_404(Todo, pk=pk)

    if request.method == "POST":
        form = TodoForm(request.POST, instance=todo)
        if form.is_valid():
            form.save()
            return redirect("todo_list")
    else:
        form = TodoForm(instance=todo)

    return render(request, "todos/todo_form.html", {"form": form, "mode": "Edit"})

def todo_delete(request, pk: int):
    todo = get_object_or_404(Todo, pk=pk)

    if request.method == "POST":
        todo.delete()
        return redirect("todo_list")

    return render(request, "todos/todo_confirm_delete.html", {"todo": todo})

@require_POST
def todo_toggle_resolved(request, pk: int):
    todo = get_object_or_404(Todo, pk=pk)
    todo.is_resolved = not todo.is_resolved
    todo.save(update_fields=["is_resolved"])
    return redirect("todo_list")