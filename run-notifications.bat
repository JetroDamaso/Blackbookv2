@echo off
REM Notification Processor for Booking System
REM This script processes pending scheduled notifications

echo ========================================
echo Processing Booking Notifications
echo ========================================

cd /d D:\Web\snr.v2\Blackbookv2
call npm run process-notifications

echo.
echo ========================================
echo Done!
echo ========================================

REM Optional: Uncomment to keep window open
REM pause
