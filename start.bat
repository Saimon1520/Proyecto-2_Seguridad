@echo off
echo ========================================
echo    Sistema de Login Seguro - NextJS
echo ========================================
echo.

echo [1/4] Verificando Docker...
docker --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Docker no está instalado o no está en el PATH
    echo Por favor instala Docker Desktop desde: https://www.docker.com/products/docker-desktop
    pause
    exit /b 1
)

echo [2/4] Creando archivo .env...
if not exist .env (
    copy env.example .env
    echo Archivo .env creado desde env.example
) else (
    echo Archivo .env ya existe
)

echo [3/4] Iniciando servicios con Docker Compose...
docker-compose up --build -d

echo [4/4] Esperando que los servicios estén listos...
timeout /t 10 /nobreak >nul

echo.
echo ========================================
echo    ¡Servicios iniciados correctamente!
echo ========================================
echo.
echo URL de la aplicación: http://localhost:3000
echo.
echo Usuarios de prueba:
echo - admin@test.com / admin123
echo - usuario@test.com / usuario123
echo - maria@test.com / maria123
echo.
echo Para ver los logs: docker-compose logs -f
echo Para detener: docker-compose down
echo.
pause 