#!/bin/sh

echo "Esperando a que PostgreSQL este listo..."

until npx prisma db push --accept-data-loss; do
  echo "PostgreSQL no esta listo aun, esperando..."
  sleep 2
done

echo "Base de datos conectada"

echo "Ejecutando migraciones..."
npx prisma migrate deploy

echo "Poblando base de datos con datos de prueba..."
npm run db:seed

echo "Iniciando aplicacion..."
npm run dev
