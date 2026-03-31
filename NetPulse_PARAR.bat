@echo off
echo  Encerrando NetPulse...
for /f "tokens=5" %%p in ('netstat -ano 2^>nul ^| findstr ":8080 " ^| findstr "LISTENING"') do (
    taskkill /PID %%p /F >nul 2>nul
)
taskkill /IM node.exe /F >nul 2>nul
echo  NetPulse encerrado!
timeout /t 2 /nobreak >nul
