#!/bin/sh

# Ejecutar migraciones si es necesario
npx prisma migrate deploy

# Iniciar la aplicación Next.js
npm start
