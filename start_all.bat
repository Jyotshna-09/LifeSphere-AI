@echo off
title LifeSphere - Start All Services
echo ===================================================
echo           Starting LifeSphere AI Ecosystem
echo ===================================================
echo [1/2] Launching FastAPI Backend on http://localhost:8000...
start "LifeSphere Backend (:8000)" cmd /k "cd /d ""%~dp0backend"" && python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload"

echo Waiting 2 seconds for backend initialization...
timeout /t 2 /nobreak >nul

echo [2/2] Launching React Vite Frontend on http://localhost:5173...
start "LifeSphere Frontend (:5173)" cmd /k "cd /d ""%~dp0frontend"" && npm run dev"

echo.
echo ===================================================
echo   LifeSphere AI is running!
echo   - Backend:  http://localhost:8000 (Docs: http://localhost:8000/docs)
echo   - Frontend: http://localhost:5173
echo ===================================================
timeout /t 5
