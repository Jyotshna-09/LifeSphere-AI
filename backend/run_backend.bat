@echo off
title LifeSphere Backend (:8000)
cd /d "%~dp0"
echo Starting LifeSphere FastAPI Backend on http://localhost:8000 ...
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
pause
