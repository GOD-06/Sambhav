# Brightloop Backend Setup Script
# Run this from the backend/ directory

Write-Host "=== Brightloop Subscription Management - Backend Setup ===" -ForegroundColor Cyan

# Create venv if not exists
if (-not (Test-Path "venv")) {
    Write-Host "Creating virtual environment..." -ForegroundColor Yellow
    python -m venv venv
}

# Activate venv
Write-Host "Activating virtual environment..." -ForegroundColor Yellow
& .\venv\Scripts\Activate.ps1

# Install requirements
Write-Host "Installing requirements..." -ForegroundColor Yellow
pip install -r requirements.txt

# Run migrations
Write-Host "Running migrations..." -ForegroundColor Yellow
python manage.py makemigrations accounts products subscriptions invoices payments discounts
python manage.py migrate

# Seed data
Write-Host "Seeding data..." -ForegroundColor Yellow
python manage.py seed_data

Write-Host ""
Write-Host "=== Setup Complete ===" -ForegroundColor Green
Write-Host "Run the server with: python manage.py runserver"
Write-Host "Admin login: admin@brightloop.com / Admin@123"
