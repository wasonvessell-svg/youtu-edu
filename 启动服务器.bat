@echo off
chcp 65001 >nul
title 优途研学社 - 服务器
cd /d "%~dp0"

echo.
echo  ╔═══════════════════════════════════════════╗
echo  ║     🎓 优途研学社 - 服务器启动             ║
echo  ║                                           ║
echo  ║  前台:  http://localhost:3000              ║
echo  ║  后台:  http://localhost:3000/admin        ║
echo  ║                                           ║
echo  ║  按 Ctrl+C 停止服务器                      ║
echo  ╚═══════════════════════════════════════════╝
echo.

cd backend
node app.js

pause
