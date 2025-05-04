<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;

class UpdateNotificationPreferenceRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        // Only allow authenticated users
        return Auth::check();
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array|string>
     */
    public function rules(): array
    {
        return [
            'email_enabled' => 'boolean',
            'browser_enabled' => 'boolean',
            'sms_enabled' => 'boolean',
            'default_reminder_minutes' => 'integer|min:1|max:10080', // Max 1 week in minutes
            'notification_settings' => 'nullable|json',
        ];
    }
}
