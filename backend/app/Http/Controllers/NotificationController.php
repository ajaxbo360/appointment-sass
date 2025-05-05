<?php

namespace App\Http\Controllers;

use App\Http\Requests\UpdateNotificationPreferenceRequest;
use App\Models\NotificationPreference;
use App\Models\Notification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class NotificationController extends Controller
{
    /**
     * Get the authenticated user's notification preferences
     */
    public function getPreferences(): JsonResponse
    {
        $user = Auth::user();

        // Get or create notification preferences for the user
        $preferences = NotificationPreference::firstOrCreate(
            ['user_id' => $user->id],
            [
                'email_enabled' => true,
                'browser_enabled' => true,
                'default_reminder_minutes' => 30,
            ]
        );

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
        $preferences = NotificationPreference::firstOrCreate(['user_id' => $user->id]);

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
        $notifications = Notification::where('user_id', $user->id)
            ->with('appointment')
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);

        return response()->json([
            'data' => $notifications,
            'message' => 'Notification history retrieved successfully',
        ]);
    }

    /**
     * Get all notifications for the authenticated user
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $user = Auth::user();

            // Get all sent notifications for the user
            $notifications = Notification::where('user_id', $user->id)
                ->with('appointment')
                ->where('status', 'sent')
                ->orderBy('created_at', 'desc')
                ->get();

            // Count unread notifications
            $unreadCount = $notifications->filter(function ($notification) {
                return !$notification->read_at;
            })->count();

            // Format the notifications for the frontend
            $formattedNotifications = $notifications->map(function ($notification) {
                $data = is_string($notification->data) ? json_decode($notification->data) : $notification->data;

                // Create content based on notification type
                $content = '';
                if ($notification->type === 'starting_soon') {
                    $content = 'Your appointment is starting soon: ' . ($data->title ?? 'Unknown');
                } else if ($notification->type === 'reminder') {
                    $content = 'You have an upcoming appointment: ' . ($data->title ?? 'Unknown');
                } else {
                    $content = 'Notification about your appointment: ' . ($data->title ?? 'Unknown');
                }

                return [
                    'id' => $notification->id,
                    'title' => $data->title ?? 'Appointment Notification',
                    'content' => $content,
                    'isRead' => !is_null($notification->read_at),
                    'createdAt' => $notification->created_at->toISOString(),
                    'appointment_id' => $notification->appointment_id
                ];
            });

            return response()->json([
                'notifications' => $formattedNotifications,
                'unreadCount' => $unreadCount
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching notifications: ' . $e->getMessage(), [
                'user_id' => Auth::id(),
                'exception' => $e
            ]);

            return response()->json([
                'notifications' => [],
                'unreadCount' => 0,
                'error' => 'Failed to load notifications'
            ], 500);
        }
    }

    /**
     * Mark a specific notification as read
     */
    public function markAsRead($id): JsonResponse
    {
        $user = Auth::user();
        $notification = Notification::where('user_id', $user->id)
            ->where('id', $id)
            ->firstOrFail();

        $notification->markAsRead();

        return response()->json([
            'message' => 'Notification marked as read'
        ]);
    }

    /**
     * Mark all notifications as read
     */
    public function markAllAsRead(): JsonResponse
    {
        $user = Auth::user();
        $notifications = Notification::where('user_id', $user->id)
            ->whereNull('read_at')
            ->get();

        foreach ($notifications as $notification) {
            $notification->markAsRead();
        }

        return response()->json([
            'message' => 'All notifications marked as read'
        ]);
    }
}
