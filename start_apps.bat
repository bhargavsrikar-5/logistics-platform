@echo off
setlocal
set "ROOT=%~dp0"
set "BACKEND=%ROOT%backend"
set "FRONTEND=%ROOT%frontend"

if not exist "%BACKEND%\.venv\Scripts\python.exe" (
  echo Backend virtual environment not found.
  echo Create it with: cd backend ^&^& python -m venv .venv
  echo Then install dependencies from requirements.txt.
  pause
  exit /b 1
)

if not exist "%FRONTEND%\node_modules" (
  echo Frontend dependencies not found.
  echo Run: cd frontend ^&^& npm ci
  pause
  exit /b 1
)

echo Starting FastAPI backend at http://127.0.0.1:8000 ...
start "Logistics API" cmd /k "cd /d ""%BACKEND%"" ^&^& ""%BACKEND%\.venv\Scripts\python.exe"" -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload"

echo Starting Vite frontend at http://localhost:5173 ...
start "Logistics Frontend" cmd /k "cd /d ""%FRONTEND%"" ^&^& npm run dev"

endlocal
