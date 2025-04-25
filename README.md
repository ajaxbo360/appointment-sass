# AppointEase - Appointment Management System

A modern SaaS application for managing appointments, built with Laravel backend and Next.js frontend.

## Setup Instructions

### Backend Setup (Laravel)

1. Clone the repository

   ```bash
   git clone <repository-url>
   cd appointment-saas
   ```

2. Set up the backend

   ```bash
   cd backend
   composer install
   cp .env.example .env
   php artisan key:generate
   php artisan migrate
   ```

3. Configure environment variables in `.env`:

   - Update database connection details
   - Set up Google OAuth credentials (if using social login)
   - Configure CORS settings (`CORS_ALLOWED_ORIGINS`)
   - Set up Sanctum domains (`SANCTUM_STATEFUL_DOMAINS`)

4. Start the Laravel server
   ```bash
   php artisan serve
   ```

### Frontend Setup (Next.js)

1. Set up the frontend

   ```bash
   cd frontend
   npm install
   cp .env.example .env.local
   ```

2. Configure environment variables in `.env.local`:

   - `NEXT_PUBLIC_API_URL`: URL for backend API (e.g., `http://localhost:8000/api`)
   - `NEXT_PUBLIC_SANCTUM_URL`: URL for Sanctum CSRF token (e.g., `http://localhost:8000/sanctum`)
   - `NEXT_PUBLIC_APP_URL`: URL for the frontend app (e.g., `http://localhost:3000`)

3. Start the Next.js development server
   ```bash
   npm run dev
   ```

### Docker Setup

You can also run the application using Docker:

```bash
docker-compose up -d
```

## Environment Variables

### Backend Environment Variables

- `APP_URL`: URL for the Laravel application
- `FRONTEND_URL`: URL for the frontend application
- `CORS_ALLOWED_ORIGINS`: Comma-separated list of domains allowed to access the API
- `SANCTUM_STATEFUL_DOMAINS`: Domains that will receive stateful API authentication cookies
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URI`: Google OAuth credentials

### Frontend Environment Variables

- `NEXT_PUBLIC_API_URL`: URL for the backend API
- `NEXT_PUBLIC_SANCTUM_URL`: URL for Sanctum CSRF token endpoint
- `NEXT_PUBLIC_APP_URL`: URL for the frontend application

## Features

- User authentication (email/password and Google OAuth)
- Appointment management (create, read, update, delete)
- Calendar view
- Category management
- Profile management

## API Endpoints

### Authentication

- `POST /api/login`: Login with email and password
- `GET /api/auth/google`: Redirect to Google OAuth
- `GET /api/auth/google/callback`: Google OAuth callback
- `POST /api/auth/logout`: Logout and invalidate token

### User Profile

- `GET /api/user`: Get authenticated user details
- `GET /api/profile`: Get user profile
- `PUT /api/profile`: Update user profile

### Appointments

- `GET /api/appointments`: List all appointments
- `POST /api/appointments`: Create new appointment
- `GET /api/appointments/{id}`: Get appointment details
- `PUT /api/appointments/{id}`: Update appointment
- `DELETE /api/appointments/{id}`: Delete appointment

### Categories

- `GET /api/categories`: List all categories
- `POST /api/categories`: Create new category
- `GET /api/categories/{id}`: Get category details
- `PUT /api/categories/{id}`: Update category
- `DELETE /api/categories/{id}`: Delete category
