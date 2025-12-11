@echo off
chcp 65001
echo ====================================
echo   智能对话系统 - 启动脚本
echo ====================================
echo.

echo [1/2] 启动后端服务器 (端口 3000)...
start "Backend Server" cmd /k "node server.js"
timeout /t 3 /nobreak > nul

echo [2/2] 启动前端开发服务器 (端口 5173)...
cd frontend
start "Frontend Dev Server" cmd /k "npm run dev"
cd ..

echo.
echo ====================================
echo   启动完成！
echo ====================================
echo.
echo 后端服务器: http://localhost:3000
echo 前端界面:   http://localhost:5173
echo.
echo 按任意键关闭此窗口...
pause > nul
