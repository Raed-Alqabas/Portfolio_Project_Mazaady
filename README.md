# Portfolio_Project_Mazaady

A Django-based portfolio project for Mazaady.

## Setup Instructions

### Prerequisites
- Python 3.8 or higher
- pip (Python package installer)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd Portfolio_Project_Mazaady
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Run database migrations:
```bash
python manage.py migrate
```

4. Create a superuser (optional):
```bash
python manage.py createsuperuser
```

5. Run the development server:
```bash
python manage.py runserver
```

6. Visit `http://127.0.0.1:8000/` in your browser to see the application.

## Project Structure

- `mazaady_portfolio/` - Main project settings and configuration
- `portfolio/` - Portfolio application
- `manage.py` - Django management script
- `requirements.txt` - Python dependencies

## Development

### Running the Development Server
```bash
python manage.py runserver
```

### Making Migrations
```bash
python manage.py makemigrations
python manage.py migrate
```

### Accessing Admin Panel
Visit `http://127.0.0.1:8000/admin/` after creating a superuser.
