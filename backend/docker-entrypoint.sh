#!/bin/sh
set -e

# Check if vendor directory exists
if [ ! -d "/var/www/html/vendor" ]; then
    echo "Vendor directory not found. Running composer install..."
    composer install --no-scripts
    echo "Composer install completed."
fi

# Check if .env file exists
if [ ! -f "/var/www/html/.env" ]; then
    echo ".env file not found. Creating from .env.example..."
    cp .env.example .env
fi

# Check if APP_KEY is empty
if grep -q "APP_KEY=" /var/www/html/.env && ! grep -q "APP_KEY=base64:" /var/www/html/.env; then
    echo "APP_KEY is empty. Generating new key..."
    php artisan key:generate
fi

# Set correct permissions
echo "Setting correct permissions..."
chown -R www-data:www-data /var/www/html/storage
chown -R www-data:www-data /var/www/html/bootstrap/cache
chmod -R 775 /var/www/html/storage
chmod -R 775 /var/www/html/bootstrap/cache

# Skip database operations to avoid errors
echo "Clearing Laravel caches..."
php artisan config:clear
php artisan route:clear
php artisan view:clear

# Run any provided command
exec "$@"
