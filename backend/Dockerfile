FROM php:8.3-fpm-alpine

# Install system dependencies
RUN apk add --no-cache \
    git \
    curl \
    libpng-dev \
    oniguruma-dev \
    libxml2-dev \
    zip \
    unzip

# Install PHP extensions
RUN docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath

# Get latest Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Set working directory
WORKDIR /var/www/html

# Copy composer files
COPY composer.json ./
COPY composer.lock* ./

# Install dependencies
RUN composer install --no-scripts --no-autoloader --no-interaction || composer update --no-scripts --no-autoloader --no-interaction

# Copy existing application directory
COPY . .

# Generate autoload files
RUN composer dump-autoload --optimize

# Create required middleware classes
RUN mkdir -p app/Http/Middleware && \
    echo "<?php namespace App\Http\Middleware; class EncryptCookies extends \Illuminate\Cookie\Middleware\EncryptCookies {}" > app/Http/Middleware/EncryptCookies.php && \
    echo "<?php namespace App\Http\Middleware; class VerifyCsrfToken extends \Illuminate\Foundation\Http\Middleware\VerifyCsrfToken {}" > app/Http/Middleware/VerifyCsrfToken.php

# Set permissions
RUN chown -R www-data:www-data /var/www/html/storage

# Expose port 8000
EXPOSE 8000

# Start PHP built-in server
CMD ["php", "artisan", "serve", "--host=0.0.0.0", "--port=8000"]
