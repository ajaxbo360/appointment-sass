<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use Illuminate\Http\Request;
use App\Http\Resources\AppointmentResource;
use App\Http\Requests\StoreAppointmentRequest;
use App\Http\Requests\UpdateAppointmentRequest;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Carbon\Carbon;

class AppointmentController extends Controller
{
    use AuthorizesRequests;

    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $appointments = auth()->user()->appointments()->with('category')->get();
        return AppointmentResource::collection($appointments);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'category_id' => 'required|exists:categories,id',
            'date' => 'required|date_format:Y-m-d',
            'time' => 'required|date_format:H:i',
            'reminder_minutes' => 'nullable|integer|min:1|max:10080', // Optional reminder time (up to 1 week)
            'notifications_enabled' => 'nullable|boolean',
        ]);

        // Combine date and time into start_time
        $startDateTime = Carbon::createFromFormat(
            'Y-m-d H:i',
            $validated['date'] . ' ' . $validated['time']
        );

        // End time is 1 hour after start by default
        $endDateTime = (clone $startDateTime)->addHour();

        $appointment = $request->user()->appointments()->create([
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'category_id' => $validated['category_id'],
            'start_time' => $startDateTime,
            'end_time' => $endDateTime,
            'status' => 'scheduled',
            'notifications_enabled' => $validated['notifications_enabled'] ?? true,
            'reminder_minutes' => $validated['reminder_minutes'] ?? 30,
        ]);

        // Generate notifications for this appointment
        $appointment->generateNotifications();

        return new AppointmentResource($appointment->load('category'));
    }

    /**
     * Display the specified resource.
     */
    public function show(Appointment $appointment)
    {
        // Authorization check
        $this->authorize('view', $appointment);

        return new AppointmentResource($appointment->load('category'));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Appointment $appointment)
    {
        // Authorization check
        $this->authorize('update', $appointment);

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'category_id' => 'required|exists:categories,id',
            'date' => 'required|date_format:Y-m-d',
            'time' => 'required|date_format:H:i',
            'reminder_minutes' => 'nullable|integer|min:1|max:10080', // Optional reminder time (up to 1 week)
            'notifications_enabled' => 'nullable|boolean',
        ]);

        // Combine date and time into start_time
        $startDateTime = Carbon::createFromFormat(
            'Y-m-d H:i',
            $validated['date'] . ' ' . $validated['time']
        );

        // End time is 1 hour after start by default
        $endDateTime = (clone $startDateTime)->addHour();

        $appointment->update([
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'category_id' => $validated['category_id'],
            'start_time' => $startDateTime,
            'end_time' => $endDateTime,
            'notifications_enabled' => $validated['notifications_enabled'] ?? $appointment->notifications_enabled,
            'reminder_minutes' => $validated['reminder_minutes'] ?? $appointment->reminder_minutes,
        ]);

        // Regenerate notifications for this appointment
        $appointment->generateNotifications();

        return new AppointmentResource($appointment->fresh()->load('category'));
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Appointment $appointment)
    {
        // Authorization check
        $this->authorize('delete', $appointment);

        $appointment->delete();

        return response()->json(['message' => 'Appointment deleted successfully']);
    }
}
