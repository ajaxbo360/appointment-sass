<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Config;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Configure Sanctum to use the correct CSRF cookie name
        Config::set('sanctum.middleware.encrypt_cookies', \App\Http\Middleware\EncryptCookies::class);
        Config::set('sanctum.middleware.verify_csrf_token', \App\Http\Middleware\VerifyCsrfToken::class);
    }
}
