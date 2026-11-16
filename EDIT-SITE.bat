@echo off
rem Grabs the latest published version (if Git is installed), then opens the site in Edge for editing.
cd /d "%~dp0"
where git >nul 2>nul
if not errorlevel 1 (
  echo Getting the latest version...
  git pull --rebase --autostash -q
)
start "" msedge "%~dp0index.html"
