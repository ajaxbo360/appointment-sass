<?php
// routes/api.php
use App\Http\Controllers\Api\AppointmentController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\ProfileController;
use App\Http\Controllers\Auth\GoogleController;
use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;
use Laravel\Sanctum\Http\Controllers\CsrfCookieController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

// CSRF Cookie Route
Route::get('/csrf-token', [CsrfCookieController::class, 'show']);

// Test route to verify API is working
Route::get('/test', function () {
    return response()->json(['message' => 'API is working']);
});

// Test login route for development purposes
Route::get('/test-login', function () {
    $user = \App\Models\User::where('email', 'test@example.com')->first();
    if (!$user) {
        return response()->json(['error' => 'Test user not found'], 404);
    }

    $token = $user->createToken('test-token')->plainTextToken;
    return response()->json([
        'token' => $token,
        'user' => $user,
        'message' => 'Use this token for testing by copying it to localStorage'
    ]);
});

// Public routes
Route::post('/login', [AuthController::class, 'login']);
Route::get('/auth/google', [GoogleController::class, 'redirect']);
Route::get('/auth/google/callback', [GoogleController::class, 'callback']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    // User routes
    Route::get('/user', function (Request $request) {
        return $request->user();
    });
    Route::post('/auth/logout', [AuthController::class, 'logout']);

    // Profile routes
    Route::get('/profile', [ProfileController::class, 'show']);
    Route::put('/profile', [ProfileController::class, 'update']);

    // Resources
    Route::apiResource('appointments', AppointmentController::class);
    Route::apiResource('categories', CategoryController::class);
});
