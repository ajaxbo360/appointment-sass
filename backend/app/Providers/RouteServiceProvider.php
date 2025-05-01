<?php

namespace App\Providers;

use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Foundation\Support\Providers\RouteServiceProvider as ServiceProvider;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Log;

class RouteServiceProvider extends ServiceProvider
{
    /**
     * The path to your application's "home" route.
     *
     * Typically, users are redirected here after authentication.
     *
     * @var string
     */
    public const HOME = '/home';

    /**
     * Define your route model bindings, pattern filters, and other route configuration.
     */
    public function boot(): void
    {
        Log::info('Starting RouteServiceProvider boot');
        RateLimiter::for('api', function (Request $request) {
            return Limit::perMinute(60)->by($request->user()?->id ?: $request->ip());
        });

        $this->routes(function () {
            Log::info('RouteServiceProvider: Loading API routes...');
            Route::middleware('api')
                ->prefix('api')
                ->group(base_path('routes/api.php'));
            Log::info('RouteServiceProvider: Finished loading API routes.');

            Log::info('RouteServiceProvider: Loading WEB routes...');
            Route::middleware('web')
                ->group(base_path('routes/web.php'));
            Log::info('RouteServiceProvider: Finished loading WEB routes.');
        });
        Log::info('Completed RouteServiceProvider boot');
    }
}
