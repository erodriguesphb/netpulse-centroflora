@echo off
setlocal EnableDelayedExpansion
title NetPulse - Centroflora
color 0A
cls

set "DIR=%~dp0"
cd /d "%DIR%"

:: Adicionar caminhos do Node.js ao PATH
set "PATH=%PATH%;%ProgramFiles%\nodejs;%ProgramFiles(x86)%\nodejs;%APPDATA%\npm;%LOCALAPPDATA%\Programs\nodejs"

echo.
echo  ============================================
echo     NetPulse - Monitor de Rede
echo     Grupo Centroflora
echo  ============================================
echo.

echo  [1/3] Verificando Node.js...
node -v >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo  ERRO: Node.js nao encontrado!
    echo  Instale em: https://nodejs.org
    pause
    exit /b 1
)
for /f "tokens=*" %%v in ('node -v 2^>nul') do set NV=%%v
echo        OK - Node.js !NV!

echo.
echo  [2/3] Verificando porta 8080...
for /f "tokens=5" %%p in ('netstat -ano 2^>nul ^| findstr ":8080 " ^| findstr "LISTENING"') do (
    taskkill /PID %%p /F >nul 2>nul
)
timeout /t 1 /nobreak >nul
echo        Porta pronta

echo.
echo  [3/3] Iniciando servidor...
echo.
echo  ============================================
echo   NESTA JANELA roda o servidor.
echo   MINIMIZE e use normalmente.
echo   Para FECHAR: pressione qualquer tecla.
echo  ============================================
echo.

start "" /b cmd /c "timeout /t 4 /nobreak >nul && start http://localhost:8080"

node "%DIR%server.js"

echo.
echo  Servidor encerrado.
pause >nul
