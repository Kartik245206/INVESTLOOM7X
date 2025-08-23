@echo off
echo Cleaning up old CSS files...

REM Create backup directory
md backup_css
move assets\css\*.css backup_css\

REM Create new directory structure
md assets\css\components
md assets\css\pages
md assets\css\utils

echo CSS cleanup complete!