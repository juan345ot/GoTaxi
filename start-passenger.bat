@echo off
cd /d "%~dp0GoTaxiPassengerApp"
echo === Iniciando Passenger App GoTaxi ===
echo Directorio: %CD%
echo Ejecutando: npm start
echo.
call npm start
pause
