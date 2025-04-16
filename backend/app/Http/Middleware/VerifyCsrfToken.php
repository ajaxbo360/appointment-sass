<?php

namespace App\Http\Middleware;

use Illuminate\Foundation\Http\Middleware\VerifyCsrfToken as Middleware;
use Closure;
use Illuminate\Http\Request;

class VerifyCsrfToken extends Middleware
{
    /**
     * The URIs that should be excluded from CSRF verification.
     *
     * @var array<int, string>
     */
    protected $except = [
        // We're now handling CSRF tokens properly, so we don't need to exclude API routes
        // 'api/*',
    ];

    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @return mixed
     */
    public function handle($request, Closure $next)
    {
        // Check if this is an API request with a token header
        if (str_starts_with($request->path(), 'api/') && $request->header('Authorization')) {
            // For API requests with token auth, we can skip CSRF
            return $next($request);
        }

        return parent::handle($request, $next);
    }
}
