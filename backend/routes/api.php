<?php
// routes/api.php
use App\Http\Controllers\Api\AppointmentController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ProfileController;
use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Http\Controllers\Auth\GoogleController;
use Laravel\Sanctum\HasApiTokens;

// Test route to verify API is working
Route::get('/test', function () {
    return response()->json(['message' => 'API is working']);
});

// Google OAuth routes
Route::post('auth/google', [GoogleController::class, 'handleLogin']);
Route::get('auth/google/callback', [GoogleController::class, 'callback']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    Route::post('/auth/logout', [AuthController::class, 'logout']);

    // Resources
    Route::apiResource('appointments', AppointmentController::class);
    Route::apiResource('categories', CategoryController::class);
});
