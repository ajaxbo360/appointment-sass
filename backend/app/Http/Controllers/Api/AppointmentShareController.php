<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\PublicAppointmentResource;
use App\Models\Appointment;
use App\Models\AppointmentShare;
use App\Services\AppointmentShareService;
use App\Services\CalendarExportService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Response;
use Symfony\Component\HttpFoundation\Response as SymfonyResponse;
use Illuminate\Support\Str;

class AppointmentShareController extends Controller
{
    /**
     * @var AppointmentShareService
     */
    protected $shareService;

    /**
     * @var CalendarExportService
     */
    protected $calendarService;

    /**
     * Create a new controller instance.
     */
    public function __construct(
        AppointmentShareService $shareService,
        CalendarExportService $calendarService
    ) {
        $this->shareService = $shareService;
        $this->calendarService = $calendarService;
    }

    /**
     * Create a new share link for an appointment
     *
     * @param Request $request
     * @param Appointment $appointment
     * @return JsonResponse
     */
    public function createShare(Request $request, Appointment $appointment): JsonResponse
    {
        // Check if user has permission to share this appointment
        if ($appointment->user_id !== $request->user()->id) {
            return response()->json(['error' => 'Unauthorized'], SymfonyResponse::HTTP_FORBIDDEN);
        }

        $expiresInDays = $request->input('expires_in_days');
        $share = $this->shareService->createShare($appointment, $expiresInDays);

        $shareUrl = route('appointments.public.view', ['token' => $share->token]);

        return response()->json([
            'share' => [
                'id' => $share->id,
                'token' => $share->token,
                'expires_at' => $share->expires_at,
                'url' => $shareUrl,
            ]
        ], SymfonyResponse::HTTP_CREATED);
    }

    /**
     * Revoke a share link
     *
     * @param Request $request
     * @param AppointmentShare $share
     * @return JsonResponse
     */
    public function revokeShare(Request $request, AppointmentShare $share): JsonResponse
    {
        // Check if user has permission to revoke this share
        if ($share->appointment->user_id !== $request->user()->id) {
            return response()->json(['error' => 'Unauthorized'], SymfonyResponse::HTTP_FORBIDDEN);
        }

        $this->shareService->revokeShare($share);

        return response()->json(null, SymfonyResponse::HTTP_NO_CONTENT);
    }

    /**
     * Public view of an appointment via share token
     *
     * @param string $token
     * @return JsonResponse|PublicAppointmentResource
     */
    public function viewPublicAppointment(string $token)
    {
        $share = $this->shareService->findValidShareByToken($token);

        if (!$share) {
            return response()->json(['error' => 'Share link is invalid or expired'], SymfonyResponse::HTTP_NOT_FOUND);
        }

        // Track this view
        $this->shareService->trackView($share);

        // Load the appointment with its category
        $appointment = $share->appointment->load('category');

        return new PublicAppointmentResource($appointment);
    }

    /**
     * Generate an iCalendar file for an appointment
     *
     * @param string $token
     * @return \Illuminate\Http\Response
     */
    public function downloadICalendar(string $token)
    {
        $share = $this->shareService->findValidShareByToken($token);

        if (!$share) {
            return response()->json(['error' => 'Share link is invalid or expired'], SymfonyResponse::HTTP_NOT_FOUND);
        }

        $appointment = $share->appointment;
        $icsContent = $this->calendarService->generateICalendar($appointment);
        $filename = Str::slug($appointment->title) . '-appointment.ics';

        return Response::make($icsContent, SymfonyResponse::HTTP_OK, [
            'Content-Type' => 'text/calendar',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
        ]);
    }

    /**
     * Get a Google Calendar URL for an appointment
     *
     * @param string $token
     * @return JsonResponse
     */
    public function getGoogleCalendarUrl(string $token): JsonResponse
    {
        $share = $this->shareService->findValidShareByToken($token);

        if (!$share) {
            return response()->json(['error' => 'Share link is invalid or expired'], SymfonyResponse::HTTP_NOT_FOUND);
        }

        $googleCalendarUrl = $this->calendarService->generateGoogleCalendarUrl($share->appointment);

        return response()->json([
            'google_calendar_url' => $googleCalendarUrl
        ]);
    }
}
