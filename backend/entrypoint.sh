#!/bin/sh
set -e


php artisan config:clear
php artisan cache:clear


echo "Running migrations..."
php artisan migrate --force

echo "Running seeders..."
php artisan db:seed --force

echo "Starting Laravel server..."
exec php artisan serve --host=0.0.0.0 --port=10000
