#!/bin/sh
set -e

# Check if vendor directory exists
if [ ! -d "/var/www/html/vendor" ]; then
    echo "Vendor directory not found. Running composer install..."
    composer install
    if [ $? -ne 0 ]; then
        echo "Composer install failed. Exiting..."
        exit 1
    fi
    echo "Composer install completed."
fi

# Check if .env file exists
if [ ! -f "/var/www/html/.env" ]; then
    echo ".env file not found. Creating from .env.example..."
    cp .env.example .env
fi

# Set correct permissions
echo "Setting correct permissions..."
chown -R www-data:www-data /var/www/html/storage
chown -R www-data:www-data /var/www/html/bootstrap/cache
chmod -R 775 /var/www/html/storage
chmod -R 775 /var/www/html/bootstrap/cache

# Only run Laravel commands if vendor directory exists
if [ -d "/var/www/html/vendor" ]; then
    # Check if APP_KEY is empty
    if grep -q "APP_KEY=" /var/www/html/.env && ! grep -q "APP_KEY=base64:" /var/www/html/.env; then
        echo "APP_KEY is empty. Generating new key..."
        php artisan key:generate
    fi

    echo "Clearing Laravel caches..."
    php artisan config:clear
    php artisan route:clear
    php artisan view:clear
fi

# Check if we should run the scheduler
if [ "$1" = "scheduler" ]; then
    echo "Starting Laravel Scheduler..."
    exec php artisan schedule:work
fi

# Check if we should run the PHP-FPM with scheduler as background process
if [ "$1" = "php-fpm-with-scheduler" ]; then
    echo "Starting Laravel Scheduler in background..."
    php artisan schedule:work &

    echo "Starting PHP-FPM..."
    exec php-fpm
fi

# Run any provided command
exec "$@"
