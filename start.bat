@echo off
setlocal
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Node.js was not found. Install the LTS version from https://nodejs.org and run this file again.
  echo You can still open index.html directly in your browser - everything works except the local C++ runner.
  pause
  exit /b 1
)
echo Starting SEERC Trainer at http://localhost:7331 ...
echo Keep this window open while using the app. Close it (or press Ctrl+C) to stop.
node server.js --open
pause
