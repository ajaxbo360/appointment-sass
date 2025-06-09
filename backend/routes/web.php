<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\GoogleController;
use App\Http\Controllers\Api\AppointmentController;
use App\Http\Controllers\Api\AuthController;
use App\Models\Appointment;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

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

// require __DIR__ . '/auth.php';

// Development helper route to assign appointments to current user
Route::get('/dev/assign-appointments-to-me', function (Request $request) {
    if (!Auth::check()) {
        return response()->json(['error' => 'You must be logged in'], 401);
    }

    $currentUser = Auth::user();
    $otherUsers = User::where('id', '!=', $currentUser->id)->get();

    $totalTransferred = 0;

    foreach ($otherUsers as $user) {
        $appointmentCount = Appointment::where('user_id', $user->id)->count();

        if ($appointmentCount > 0) {
            Appointment::where('user_id', $user->id)
                ->update(['user_id' => $currentUser->id]);

            $totalTransferred += $appointmentCount;
        }
    }

    return response()->json([
        'message' => "Successfully transferred {$totalTransferred} appointments to {$currentUser->email}",
        'transferred_count' => $totalTransferred
    ]);
})->middleware('auth')->name('dev.assign-appointments');
