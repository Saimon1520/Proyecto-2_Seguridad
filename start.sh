#!/bin/sh

echo "🔄 Esperando a que PostgreSQL esté listo..."

# Esperar a que PostgreSQL esté disponible
until npx prisma db push --accept-data-loss; do
  echo "⏳ PostgreSQL no está listo aún, esperando..."
  sleep 2
done

echo "✅ Base de datos conectada"

echo "🔄 Ejecutando migraciones..."
npx prisma migrate deploy

echo "🔄 Poblando base de datos con datos de prueba..."
npm run db:seed

echo "🚀 Iniciando aplicación..."
npm run dev 