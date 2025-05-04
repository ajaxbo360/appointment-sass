<?php

namespace App\Http\Controllers;

use App\Http\Requests\UpdateNotificationPreferenceRequest;
use App\Models\NotificationPreference;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class NotificationController extends Controller
{
    /**
     * Get the authenticated user's notification preferences
     */
    public function getPreferences(): JsonResponse
    {
        $user = Auth::user();

        // Get or create notification preferences for the user
        $preferences = $user->getOrCreateNotificationPreference();

        return response()->json([
            'data' => $preferences,
            'message' => 'Notification preferences retrieved successfully',
        ]);
    }

    /**
     * Update the authenticated user's notification preferences
     */
    public function updatePreferences(UpdateNotificationPreferenceRequest $request): JsonResponse
    {
        $user = Auth::user();
        $validatedData = $request->validated();

        // Get or create notification preferences for the user
        $preferences = $user->getOrCreateNotificationPreference();

        // Update the preferences with the validated data
        $preferences->update($validatedData);

        return response()->json([
            'data' => $preferences->fresh(),
            'message' => 'Notification preferences updated successfully',
        ]);
    }

    /**
     * Get notification history for the authenticated user
     */
    public function getHistory(Request $request): JsonResponse
    {
        $user = Auth::user();
        $perPage = $request->get('per_page', 10);

        // Get notifications with pagination
        $notifications = $user->notifications()
            ->with('appointment')
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);

        return response()->json([
            'data' => $notifications,
            'message' => 'Notification history retrieved successfully',
        ]);
    }
}
