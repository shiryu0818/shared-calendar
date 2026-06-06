@echo off
REM Shared Calendar Web App 启动バッチ
REM ルートから backend と frontend を別ウィンドウで起動します。

cd /d "%~dp0"

start "Shared Calendar Backend" cmd /k "cd /d "%~dp0backend" && npm install && npm run start:dev"
start "Shared Calendar Frontend" cmd /k "cd /d "%~dp0frontend" && npm install && npm run dev"

echo Backend and Frontend are starting in separate windows.
echo If the windows do not open, please run the commands manually:
echo   cd /d "%~dp0backend" && npm install && npm run start:dev
echo   cd /d "%~dp0frontend" && npm install && npm run dev
pause