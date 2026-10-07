@echo off
title ClimaAlert 2.0 - Launcher
echo ===================================================
echo ⛈️ Iniciando ClimaAlert (Frontend + Backend)
echo ===================================================
echo.

start "ClimaAlert - Frontend (Vite)" cmd /k "cd frontend && npm run dev"
start "ClimaAlert - Backend (Python)" cmd /k "venv\Scripts\activate && cd backend && python main.py"

echo ¡Servidores iniciados en ventanas independientes!
