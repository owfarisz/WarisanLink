#!/bin/bash
set -e

APP_DIR="/var/www/warisan-link"
REPO="git@github.com:yourusername/warisan-link.git"

echo "=== Pulling latest code ==="
cd $APP_DIR
git pull origin main

echo "=== Installing backend dependencies ==="
cd $APP_DIR/backend
npm install --production

echo "=== Running Prisma migrations ==="
npx prisma migrate deploy

echo "=== Building frontend ==="
cd $APP_DIR/frontend
npm install
npm run build

echo "=== Copying build to web root ==="
cp -r dist/* $APP_DIR/dist/

echo "=== Restarting backend (PM2) ==="
pm2 restart warisan-backend || pm2 start $APP_DIR/backend/server.js --name warisan-backend

echo "=== Reloading Nginx ==="
sudo nginx -t && sudo systemctl reload nginx

echo "=== Deploy selesai! ==="
