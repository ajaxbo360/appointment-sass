<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use Illuminate\Http\Request;
use App\Http\Resources\AppointmentResource;
use App\Http\Requests\StoreAppointmentRequest;
use App\Http\Requests\UpdateAppointmentRequest;

class AppointmentController extends Controller
{
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
            'date' => 'required|date',
            'time' => 'required',
        ]);

        $appointment = $request->user()->appointments()->create([
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'category_id' => $validated['category_id'],
            'scheduled_at' => $validated['date'] . ' ' . $validated['time'],
        ]);

        return response()->json($appointment, 201);
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
            'date' => 'required|date',
            'time' => 'required',
        ]);

        $appointment->update([
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'category_id' => $validated['category_id'],
            'scheduled_at' => $validated['date'] . ' ' . $validated['time'],
        ]);

        return response()->json($appointment->fresh()->load('category'));
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
