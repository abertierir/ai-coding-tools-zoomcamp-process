# TODO App - Django

A web-based TODO task management application built with Django, allowing you to create, edit, delete, and mark tasks as completed.

## 📋 Features

- ✅ **Create tasks** with title and optional due date
- 📝 **Edit existing tasks**
- 🗑️ **Delete tasks** with confirmation
- ✔️ **Mark tasks** as resolved/open with a single click
- 🔍 **Search tasks** by title
- 🏷️ **Filter tasks** by status (all/open/resolved)
- 📅 **Automatic detection** of overdue tasks
- 📊 **Smart sorting**: open tasks first, then by due date

## 🚀 Installation and Setup

### Prerequisites

- Python 3.8 or higher
- pip (Python package manager)
- Git

### Detailed Installation Steps

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd "AI Coding Tools"  # Navigate to your workspace
   ```

2. **Navigate to the project directory**

   ```bash
   cd 01-todo
   ```

3. **Activate the virtual environment**

   ```bash
   # On macOS/Linux
   source venv/bin/activate

   # On Windows
   venv\Scripts\activate
   ```

   > **Note**: If the virtual environment doesn't exist yet, create it first:
   >
   > ```bash
   > python3 -m venv venv
   > pip install django==4.2.28
   > ```

4. **Navigate to the Django project directory**

   ```bash
   cd TODOapp
   ```

5. **Apply database migrations**

   ```bash
   python manage.py migrate
   ```

6. **Create a superuser** (optional, for admin access)

   ```bash
   python manage.py createsuperuser
   ```

7. **Start the development server**

   ```bash
   python manage.py runserver
   ```

8. **Open in browser**

   Visit: [http://127.0.0.1:8000/](http://127.0.0.1:8000/)

> **📝 Note**: The virtual environment is located in the `01-todo` directory. Always activate it from there before changing to the `TODOapp` directory to run Django commands.

## 📊 Data Model

### `Todo` Model

| Field         | Type           | Description                     |
| ------------- | -------------- | ------------------------------- |
| `id`          | AutoField      | Unique identifier (primary key) |
| `title`       | CharField(200) | Task title (required)           |
| `due_date`    | DateField      | Due date (optional)             |
| `is_resolved` | BooleanField   | Task status (default: False)    |
| `created_at`  | DateTimeField  | Creation date (auto)            |
| `updated_at`  | DateTimeField  | Last update date (auto)         |

**Methods:**

- `is_overdue()`: Returns `True` if the task is overdue (has a due date, is in the past, and is not resolved)

## 🔧 Development

### Available URLs

| URL             | View                   | Name                   | Description          |
| --------------- | ---------------------- | ---------------------- | -------------------- |
| `/`             | `todo_list`            | `todo_list`            | Task list            |
| `/new/`         | `todo_create`          | `todo_create`          | Create new task      |
| `/<pk>/edit/`   | `todo_edit`            | `todo_edit`            | Edit task            |
| `/<pk>/delete/` | `todo_delete`          | `todo_delete`          | Delete task          |
| `/<pk>/toggle/` | `todo_toggle_resolved` | `todo_toggle_resolved` | Toggle status (POST) |
| `/admin/`       | Django Admin           | -                      | Admin panel          |

### Customization

- **Styles**: Modify templates in `todos/templates/todos/`
- **Business logic**: Update `todos/views.py` and `todos/models.py`
- **Configuration**: Adjust `TODOapp/settings.py`

## 🤝 Contributing

This is a learning/demonstration project. Feel free to:

- Fork the project
- Create issues to report bugs
- Submit pull requests with improvements

## � Further Documentation

- **[🏗️ ARCHITECTURE.md](ARCHITECTURE.md)** - Complete architecture documentation:
  - MTV pattern and component diagrams
  - Request/response flow with sequence diagrams
  - Database schema and relationships
  - Design patterns and best practices
  - Scalability considerations
- **[📦 DEPLOYMENT.md](DEPLOYMENT.md)** - Complete deployment guide covering:
  - Heroku, Railway, and DigitalOcean deployment
  - Docker containerization
  - VPS setup with Nginx and Gunicorn
  - Production security best practices
  - Monitoring and maintenance

- **[🎓 LEARNING.md](LEARNING.md)** - Structured learning path including:
  - Prerequisites and time estimates
  - Phase-by-phase guide from basics to advanced
  - 20+ practice exercises
  - Testing and deployment tutorials
  - Resources and next steps

## �📄 License

This project is open source and available under your preferred license.

---

**Django Version**: 4.2.28  
**Python**: 3.8+  
**Last Updated**: February 2026
