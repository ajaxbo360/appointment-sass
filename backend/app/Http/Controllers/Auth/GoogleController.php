<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Laravel\Socialite\Facades\Socialite;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class GoogleController extends Controller
{
    public function handleLogin(Request $request)
    {
        try {
            $url = Socialite::driver('google')
                ->scopes(['openid', 'email', 'profile'])
                ->stateless()
                ->redirect()
                ->getTargetUrl();

            return response()->json(['url' => $url]);
        } catch (\Exception $e) {
            Log::error('Google OAuth URL generation failed', [
                'error' => $e->getMessage()
            ]);
            return response()->json(['error' => 'Failed to generate login URL'], 500);
        }
    }

    public function callback(Request $request)
    {
        try {
            // Log the incoming request for debugging
            Log::info('Google callback received', [
                'code' => $request->code,
                'state' => $request->state
            ]);

            // Use stateless() here to match the redirect method
            $googleUser = Socialite::driver('google')->stateless()->user();

            Log::info('Google user retrieved', [
                'id' => $googleUser->id,
                'email' => $googleUser->email
            ]);

            $user = User::updateOrCreate(
                ['email' => $googleUser->email],
                [
                    'name' => $googleUser->name,
                    'google_id' => $googleUser->id,
                    'avatar' => $googleUser->avatar,
                    'password' => bcrypt(Str::random(16))
                ]
            );

            $token = $user->createToken('auth-token')->plainTextToken;

            Log::info('User authenticated', [
                'user_id' => $user->id,
                'token' => $token
            ]);

            return redirect()->away(
                "http://localhost:3000/auth/callback?token={$token}&user=" . urlencode(json_encode($user))
            );
        } catch (\Exception $e) {
            $errorMessage = $e->getMessage() ?: 'Authentication failed';
            Log::error('Google callback error', [
                'message' => $errorMessage,
                'trace' => $e->getTraceAsString()
            ]);

            return redirect()->away(
                "http://localhost:3000/login?error=" . urlencode($errorMessage)
            );
        }
    }

    public function logout(Request $request)
    {
        try {
            $request->user()->currentAccessToken()->delete();
            return response()->json(['message' => 'Logged out successfully']);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Logout failed'], 500);
        }
    }
}
