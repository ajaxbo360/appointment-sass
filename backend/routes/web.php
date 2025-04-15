<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\GoogleController;
use App\Http\Controllers\Api\AppointmentController;
use App\Http\Controllers\Api\AuthController;

// Web routes (use 'web' middleware group)
Route::middleware('web')->group(function () {
    Route::get('/', function () {
        return view('welcome');
    });

    Route::get('/test', function () {
        return response()->json(['message' => 'Web routes are working']);
    });
});

// API routes (use 'api' middleware group, /api prefix)
Route::middleware('api')->prefix('api')->group(function () {
    // Google OAuth routes
    Route::get('/auth/google', [GoogleController::class, 'handleLogin']);
    Route::get('/auth/google/callback', [GoogleController::class, 'callback']);

    // Public API routes
    Route::post('/auth/register', [AuthController::class, 'register']);
    Route::post('/auth/login', [AuthController::class, 'login']);

    // Protected API routes
    Route::middleware('auth:sanctum')->group(function () {
        Route::apiResource('appointments', AppointmentController::class);
        Route::post('/auth/logout', [AuthController::class, 'logout']);
        Route::get('/user', fn() => request()->user());
    });

    // Health check
    Route::get('/health', fn() => ['status' => 'ok']);
});
