<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class ClearConflictingCookies
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        // Only process API requests
        if (str_starts_with($request->path(), 'api/')) {
            // Get all cookies from the request
            $cookies = $request->cookies->all();

            // List of cookies to keep
            $keepCookies = [
                'appointease_session',
                'XSRF-TOKEN',
            ];

            // Remove all cookies except the ones we want to keep
            foreach ($cookies as $name => $value) {
                if (!in_array($name, $keepCookies)) {
                    $response->headers->clearCookie($name);
                }
            }
        }

        return $response;
    }
}
