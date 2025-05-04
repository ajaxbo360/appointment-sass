<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Appointment Reminder</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            padding: 20px;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background: #fff;
            border-radius: 10px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
            padding: 30px;
        }
        .header {
            text-align: center;
            margin-bottom: 20px;
            border-bottom: 1px solid #eee;
            padding-bottom: 15px;
        }
        .header h1 {
            color: #4f46e5;
            margin: 0;
            font-size: 24px;
        }
        .appointment-details {
            margin-bottom: 25px;
        }
        .appointment-details h2 {
            color: #4f46e5;
            font-size: 18px;
            margin-top: 0;
        }
        .detail-item {
            margin-bottom: 12px;
        }
        .detail-label {
            font-weight: bold;
            margin-right: 5px;
        }
        .button {
            display: inline-block;
            background-color: #4f46e5;
            color: white;
            text-decoration: none;
            padding: 10px 20px;
            border-radius: 5px;
            margin-top: 10px;
            margin-right: 10px;
        }
        .footer {
            text-align: center;
            margin-top: 30px;
            font-size: 12px;
            color: #666;
            border-top: 1px solid #eee;
            padding-top: 15px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Appointment Reminder</h1>
        </div>

        <div class="appointment-details">
            <p>Hello {{ $user->name }},</p>

            <p>This is a reminder about your upcoming appointment:</p>

            <div class="detail-item">
                <span class="detail-label">Title:</span> {{ $title }}
            </div>

            <div class="detail-item">
                <span class="detail-label">Date:</span> {{ $startTime->format('l, F j, Y') }}
            </div>

            <div class="detail-item">
                <span class="detail-label">Time:</span> {{ $startTime->format('g:i A') }} - {{ $endTime->format('g:i A') }}
            </div>

            <div class="detail-item">
                <span class="detail-label">Category:</span> {{ $category }}
            </div>

            @if($description)
            <div class="detail-item">
                <span class="detail-label">Description:</span> {{ $description }}
            </div>
            @endif
        </div>

        <div class="actions">
            <p>You can manage this appointment in your dashboard:</p>
            <a href="{{ config('app.url') }}/appointments" class="button">View Appointment</a>
        </div>

        <div class="footer">
            <p>This is an automated message. Please do not reply to this email.</p>
            <p>&copy; {{ date('Y') }} Appointment SaaS. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
