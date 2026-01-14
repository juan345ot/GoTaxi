#!/bin/bash
cd "$(dirname "$0")/go-taxi-backend"
echo "=== Iniciando Backend GoTaxi ==="
echo "Directorio: $(pwd)"
echo "Ejecutando: npm run dev"
echo ""
npm run dev
