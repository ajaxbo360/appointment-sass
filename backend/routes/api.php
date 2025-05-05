<?php
// routes/api.php
use App\Http\Controllers\Api\AppointmentController;
use App\Http\Controllers\Api\AppointmentShareController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\ProfileController;
use App\Http\Controllers\Auth\GoogleController;
use App\Http\Controllers\NotificationController;
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

// Public appointment share routes (rate limited)
Route::middleware('throttle:60,1')->group(function () {
    Route::get('/appointments/share/{token}', [AppointmentShareController::class, 'viewPublicAppointment'])
        ->name('appointments.public.view');
    Route::get('/appointments/share/{token}/ical', [AppointmentShareController::class, 'downloadICalendar'])
        ->name('appointments.public.ical');
    Route::get('/appointments/share/{token}/google-calendar', [AppointmentShareController::class, 'getGoogleCalendarUrl'])
        ->name('appointments.public.google');
});

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

    // Appointment sharing routes
    Route::post('/appointments/{appointment}/share', [AppointmentShareController::class, 'createShare'])
        ->name('appointments.share.create');
    Route::delete('/appointments/shares/{share}', [AppointmentShareController::class, 'revokeShare'])
        ->name('appointments.share.revoke');

    // Notification routes
    Route::prefix('notifications')->group(function () {
        Route::get('/', [NotificationController::class, 'index']);
        Route::get('/preferences', [NotificationController::class, 'getPreferences']);
        Route::put('/preferences', [NotificationController::class, 'updatePreferences']);
        Route::get('/history', [NotificationController::class, 'getHistory']);
        Route::post('/{id}/read', [NotificationController::class, 'markAsRead']);
        Route::post('/read-all', [NotificationController::class, 'markAllAsRead']);
    });

    // Explicit Category Routes (Keep commented out for now)
    // Route::get('/categories', [CategoryController::class, 'index'])->name('categories.index');
    // Route::post('/categories', [CategoryController::class, 'store'])->name('categories.store');
    // Route::get('/categories/{category}', [CategoryController::class, 'show'])->name('categories.show');
    // Route::put('/categories/{category}', [CategoryController::class, 'update'])->name('categories.update');
    // Route::patch('/categories/{category}', [CategoryController::class, 'update']);
    // Route::delete('/categories/{category}', [CategoryController::class, 'destroy'])->name('categories.destroy');
});
