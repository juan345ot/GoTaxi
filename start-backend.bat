@echo off
cd /d "%~dp0go-taxi-backend"
echo === Iniciando Backend GoTaxi ===
echo Directorio: %CD%
echo Ejecutando: npm run dev
echo.
call npm run dev
pause
