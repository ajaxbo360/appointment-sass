<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\GoogleController;

// Test route
Route::get('/test', function () {
    return response()->json(['message' => 'Web routes are working']);
});

// Google OAuth routes
Route::get('/api/auth/google', [GoogleController::class, 'handleLogin']);
Route::get('/api/auth/google/callback', [GoogleController::class, 'callback']);

Route::get('/', function () {
    return view('welcome');
});
