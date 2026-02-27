# TODO App - Django

A web-based TODO task management application built with Django, allowing you to create, edit, delete, and mark tasks as completed.

## 📖 Documentation

- **[ARCHITECTURE.md](ARCHITECTURE.md)** - Architecture diagrams, design patterns, and component structure
- **[DEPLOYMENT.md](DEPLOYMENT.md)** - Comprehensive deployment guide (Heroku, Railway, Docker, VPS)
- **[LEARNING.md](LEARNING.md)** - Structured learning path for Django beginners to advanced

## �📋 Features

- ✅ **Create tasks** with title and optional due date
- 📝 **Edit existing tasks**
- 🗑️ **Delete tasks** with confirmation
- ✔️ **Mark tasks** as resolved/open with a single click
- 🔍 **Search tasks** by title
- 🏷️ **Filter tasks** by status (all/open/resolved)
- 📅 **Automatic detection** of overdue tasks
- 📊 **Smart sorting**: open tasks first, then by due date

## 🛠️ Technologies Used

- **Python 3.x**
- **Django 4.2.28**
- **SQLite3** (database)
- **HTML/CSS** for templates

## 📁 Project Structure

```
TODOapp/
├── manage.py                 # Django management script
├── db.sqlite3                # SQLite database
├── TODOapp/                  # Main project directory
│   ├── __init__.py
│   ├── settings.py           # Project settings
│   ├── urls.py               # Main URLs
│   ├── wsgi.py               # WSGI configuration
│   └── asgi.py               # ASGI configuration
└── todos/                    # TODOs application
    ├── models.py             # Todo model
    ├── views.py              # Views (todo_list, todo_create, etc.)
    ├── forms.py              # TodoForm
    ├── urls.py               # App URLs
    ├── admin.py              # Admin configuration
    ├── migrations/           # Database migrations
    └── templates/            # HTML templates
        └── todos/
            ├── base.html                    # Base template
            ├── home.html                    # Task list
            ├── todo_form.html               # Create/edit form
            └── todo_confirm_delete.html     # Delete confirmation
```

**For detailed architecture diagrams and design patterns, see [ARCHITECTURE.md](ARCHITECTURE.md)**

### Prerequisites

- Python 3.8 or higher
- pip (Python package manager)

### Installation Steps

1. **Clone or download the project**

   ```bash
   cd 01-todo/TODOapp
   ```

2. **Create and activate a virtual environment** (recommended)

   ```bash
   # On macOS/Linux
   python3 -m venv venv
   source venv/bin/activate

   # On Windows
   python -m venv venv
   venv\Scripts\activate
   ```

3. **Install Django**

   ```bash
   pip install django==4.2.28
   ```

4. **Apply migrations**

   ```bash
   python manage.py migrate
   ```

5. **Create a superuser** (optional, for admin access)

   ```bash
   python manage.py createsuperuser
   ```

6. **Start the development server**

   ```bash
   python manage.py runserver
   ```

7. **Open in browser**

   Visit: [http://127.0.0.1:8000/](http://127.0.0.1:8000/)

## 📖 Usage

### Main Interface

- **View all tasks**: `/` - displays all tasks
- **Filter by status**:
  - `/?status=open` - only open tasks
  - `/?status=resolved` - only completed tasks
  - `/?status=all` - all tasks
- **Search**: `/?q=term` - searches in titles

### Available Actions

1. **Create new task**: Click on "+ Add New TODO"
2. **Mark as completed**: Click on "Resolve"
3. **Mark as open**: Click on "Mark Open"
4. **Edit task**: Click on "Edit"
5. **Delete task**: Click on "Delete" and confirm

### Admin Panel

Access the Django admin panel at: [http://127.0.0.1:8000/admin/](http://127.0.0.1:8000/admin/)

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

### Useful Commands

```bash
# Create migrations after changes in models.py
python manage.py makemigrations

# Apply migrations
python manage.py migrate

# Run tests
python manage.py test

# Create a superuser
python manage.py createsuperuser

# Django shell (interactive)
python manage.py shell

# Collect static files (production)
python manage.py collectstatic
```

## ⚠️ Security Notes

**IMPORTANT**: This configuration is for development only. Before deploying to production:

- [ ] Change `SECRET_KEY` in `settings.py`
- [ ] Set `DEBUG = False`
- [ ] Configure `ALLOWED_HOSTS`
- [ ] Use a production database (PostgreSQL, MySQL, etc.)
- [ ] Configure static and media files
- [ ] Implement HTTPS
- [ ] Review all Django security settings

## 📝 Technical Features

- **Automatic sorting**: Tasks are displayed with open ones first, then by due date, and finally the most recent
- **Case-insensitive search**: Search doesn't distinguish between uppercase and lowercase
- **AJAX-ready markup**: Status toggle uses POST and redirects (easy to convert to AJAX)
- **Form validation**: Django forms with built-in validation
- **CSRF protection**: All forms include CSRF token
- **Custom error pages**: Includes 404.html and 500.html templates

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
