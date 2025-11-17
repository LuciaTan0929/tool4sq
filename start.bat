@echo off
chcp 65001 >nul
echo ============================================================
echo 🎧 耳机音质对比工具 - 启动脚本
echo ============================================================
echo.

REM 检查Python是否安装
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ 错误: 未检测到Python，请先安装Python 3.7+
    echo 下载地址: https://www.python.org/downloads/
    pause
    exit /b 1
)

echo ✅ Python已安装
echo.

REM 检查是否已安装依赖
python -c "import flask" >nul 2>&1
if errorlevel 1 (
    echo 📦 正在安装依赖...
    pip install -r requirements.txt
    if errorlevel 1 (
        echo ❌ 依赖安装失败，请检查网络连接
        pause
        exit /b 1
    )
    echo ✅ 依赖安装完成
    echo.
)

echo 🚀 启动服务器...
echo.
python app.py

pause
