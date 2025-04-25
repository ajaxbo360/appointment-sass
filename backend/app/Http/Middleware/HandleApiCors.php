<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class HandleApiCors
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        // Get the allowed origins from environment variable or default to localhost:3000
        $allowedOrigins = env('CORS_ALLOWED_ORIGINS', 'http://localhost:3000');
        $origins = explode(',', $allowedOrigins);

        // Get the request origin
        $origin = $request->header('Origin');

        // Add CORS headers for API requests
        if (str_starts_with($request->path(), 'api/')) {
            // Check if the request origin is allowed
            if ($origin && in_array($origin, $origins)) {
                $response->headers->set('Access-Control-Allow-Origin', $origin);
            } else {
                // If no origin or not in allowed list, use the first allowed origin
                $response->headers->set('Access-Control-Allow-Origin', $origins[0]);
            }

            $response->headers->set('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
            $response->headers->set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-XSRF-TOKEN, X-Requested-With');
            $response->headers->set('Access-Control-Allow-Credentials', 'true');

            // Handle preflight OPTIONS requests
            if ($request->isMethod('OPTIONS')) {
                $response->headers->set('Access-Control-Max-Age', '86400');
                return $response;
            }
        }

        return $response;
    }
}
