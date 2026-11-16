@echo off
rem Sends your saved changes to GitHub, which updates the live website.
rem It first grabs any changes the other person published, so you don't overwrite each other.
cd /d "%~dp0"
where git >nul 2>nul
if errorlevel 1 (
  echo Git is not installed on this computer. Use the "Upload files" steps in HOW-TO-EDIT.md instead.
  pause
  exit /b 1
)
echo Publishing your changes to the live website...
echo.
git add -A
git commit -q -m "Update site content"
git pull --rebase -q
if errorlevel 1 (
  git rebase --abort >nul 2>nul
  echo You and the other person both changed the same text. Nothing was published.
  echo Take a screenshot of this window and send it to Jake.
  pause
  exit /b 1
)
git push -q
if errorlevel 1 (
  echo Something went wrong. Nothing was published. Take a screenshot of this window.
) else (
  echo Done. The live site updates in about a minute.
)
echo.
pause
