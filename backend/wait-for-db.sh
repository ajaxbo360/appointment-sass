#!/bin/sh
set -e

# Wait for MySQL to be ready - using a different approach to disable SSL
until mysql -h db -u $DB_USERNAME -p$DB_PASSWORD --ssl=0 -e "SELECT 1"; do
  echo "MySQL is unavailable - sleeping"
  sleep 3
done

echo "MySQL is up - starting Laravel"
php artisan serve --host=0.0.0.0 --port=8000
