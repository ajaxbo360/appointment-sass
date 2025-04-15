<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;

class AppointmentController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $appointments = Appointment::where('user_id', Auth::id())
            ->orderBy('scheduled_at', 'desc')
            ->get();

        return response()->json([
            'data' => $appointments
        ]);
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
        ]);

        // Combine date and time into a single datetime
        $scheduledAt = Carbon::createFromFormat(
            'Y-m-d H:i',
            $validated['date'] . ' ' . $validated['time']
        );

        $appointment = Appointment::create([
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'category_id' => $validated['category_id'],
            'user_id' => Auth::id(),
            'scheduled_at' => $scheduledAt,
            'status' => 'scheduled',
        ]);

        return response()->json([
            'message' => 'Appointment created successfully',
            'data' => $appointment
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Appointment $appointment)
    {
        // Check if the appointment belongs to the authenticated user
        if ($appointment->user_id !== Auth::id()) {
            return response()->json([
                'message' => 'Unauthorized'
            ], 403);
        }

        return response()->json($appointment);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Appointment $appointment)
    {
        // Check if the appointment belongs to the authenticated user
        if ($appointment->user_id !== Auth::id()) {
            return response()->json([
                'message' => 'Unauthorized'
            ], 403);
        }

        $validated = $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'category_id' => 'sometimes|required|exists:categories,id',
            'date' => 'sometimes|required|date_format:Y-m-d',
            'time' => 'sometimes|required|date_format:H:i',
            'status' => 'sometimes|in:scheduled,completed,cancelled',
        ]);

        // If date or time is provided, update scheduled_at
        if (isset($validated['date']) && isset($validated['time'])) {
            $scheduledAt = Carbon::createFromFormat(
                'Y-m-d H:i',
                $validated['date'] . ' ' . $validated['time']
            );
            $appointment->scheduled_at = $scheduledAt;
        }

        // Update other fields
        if (isset($validated['title'])) {
            $appointment->title = $validated['title'];
        }

        if (array_key_exists('description', $validated)) {
            $appointment->description = $validated['description'];
        }

        if (isset($validated['category_id'])) {
            $appointment->category_id = $validated['category_id'];
        }

        if (isset($validated['status'])) {
            $appointment->status = $validated['status'];
        }

        $appointment->save();

        return response()->json([
            'message' => 'Appointment updated successfully',
            'data' => $appointment
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Appointment $appointment)
    {
        // Check if the appointment belongs to the authenticated user
        if ($appointment->user_id !== Auth::id()) {
            return response()->json([
                'message' => 'Unauthorized'
            ], 403);
        }

        $appointment->delete();

        return response()->json([
            'message' => 'Appointment deleted successfully'
        ]);
    }
}
