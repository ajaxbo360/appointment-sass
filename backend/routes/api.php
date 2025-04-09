<?php
// routes/api.php
use App\Http\Controllers\Api\AppointmentController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ProfileController;
use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

// Auth routes
Route::post('/auth/google', 'App\Http\Controllers\Auth\GoogleController@handleLogin');
Route::post('/auth/logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');

// Temporary login for testing
Route::post('/auth/login', function (Request $request) {
    $credentials = $request->validate([
        'email' => 'required|email',
        'password' => 'required',
    ]);

    if (Auth::attempt($credentials)) {
        $user = Auth::user();
        $token = $user->createToken('auth-token')->plainTextToken;

        return response()->json([
            'user' => $user,
            'token' => $token,
        ]);
    }

    return response()->json(['message' => 'Invalid credentials'], 401);
});

// User profile
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', [ProfileController::class, 'show']);
    Route::put('/user', [ProfileController::class, 'update']);

    // Resource routes
    Route::apiResource('appointments', AppointmentController::class);
    Route::apiResource('categories', CategoryController::class);
});
