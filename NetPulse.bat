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
    echo.
    echo  Node.js nao encontrado. Iniciando instalacao automatica...
    echo.

    set "MSI=%DIR%node-v24.14.1-x64.msi"
    if not exist "!MSI!" (
        echo  ERRO: Arquivo !MSI! nao encontrado.
        echo  Instale manualmente em: https://nodejs.org
        pause
        exit /b 1
    )

    echo  Instalando Node.js silenciosamente, aguarde...
    msiexec /i "!MSI!" /quiet /norestart
    if %ERRORLEVEL% NEQ 0 (
        echo  ERRO: Falha na instalacao do Node.js.
        echo  Tente instalar manualmente em: https://nodejs.org
        pause
        exit /b 1
    )

    echo  Instalacao concluida! Reiniciando NetPulse...
    timeout /t 2 /nobreak >nul

    :: Atualiza PATH com o Node.js recem instalado
    set "PATH=%PATH%;%ProgramFiles%\nodejs;%ProgramFiles(x86)%\nodejs;%APPDATA%\npm;%LOCALAPPDATA%\Programs\nodejs"

    :: Verifica se agora funciona
    node -v >nul 2>nul
    if %ERRORLEVEL% NEQ 0 (
        echo  AVISO: Node.js instalado mas nao reconhecido ainda.
        echo  Feche esta janela e abra o NetPulse.bat novamente.
        pause
        exit /b 1
    )

    echo  Node.js pronto!
    echo.
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
