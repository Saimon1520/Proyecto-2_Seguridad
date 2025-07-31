@echo off
echo ========================================
echo    Configuración de Base de Datos
echo ========================================
echo.

echo [1/3] Verificando que los servicios estén ejecutándose...
docker-compose ps | findstr "Up" >nul
if errorlevel 1 (
    echo ERROR: Los servicios no están ejecutándose
    echo Ejecuta primero: start.bat
    pause
    exit /b 1
)

echo [2/3] Ejecutando migraciones de Prisma...
docker-compose exec app npm run db:migrate

echo [3/3] Poblando base de datos con datos de prueba...
docker-compose exec app npm run db:seed

echo.
echo ========================================
echo    ¡Base de datos configurada!
echo ========================================
echo.
echo Usuarios creados:
echo - admin@test.com / admin123
echo - usuario@test.com / usuario123
echo - maria@test.com / maria123
echo.
echo Puedes acceder a la aplicación en: http://localhost:3000
echo.
pause 