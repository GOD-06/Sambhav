@echo off
echo ====================================================
echo Starting Brightloop Subscription Management System
echo ====================================================
echo.

echo Starting Django Backend Server on http://localhost:8000...
start cmd /k "cd backend && .\venv\Scripts\activate.bat && python manage.py runserver 8000"

timeout /t 3 /nobreak > nul

echo Starting React Frontend on http://localhost:5173...
start cmd /k "cd frontend && npm run dev"

echo.
echo Both servers are starting!
echo Frontend will be accessible at: http://localhost:5173
echo Backend API will be accessible at: http://localhost:8000/api/v1/
echo.
pause
