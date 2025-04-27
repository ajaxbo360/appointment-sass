# AppointEase - Application Documentation

## Overview

AppointEase is a modern appointment scheduling and management application built with a Laravel backend API and Next.js frontend. It allows users to authenticate via Google OAuth, manage appointments, and organize them by categories.

## System Architecture

The application follows a client-server architecture:

- **Backend**: Laravel API with Sanctum authentication
- **Frontend**: Next.js with TypeScript
- **Authentication**: Google OAuth

## Authentication

### Authentication Flow

1. **Google OAuth**: Users authenticate exclusively through Google OAuth

   - The system automatically creates a user account if one doesn't exist
   - User profile information is fetched from Google (name, email, avatar)

2. **Token-based Authentication**:
   - After successful Google authentication, the backend generates a Sanctum token
   - This token is used for all authenticated API requests

### Authentication Endpoints

- `GET /api/auth/google` - Redirect to Google OAuth
- `GET /api/auth/google/callback` - Handle Google OAuth callback
- `POST /api/auth/logout` - Log out user (invalidate token)

## Core Functionality

### Dashboard

The dashboard provides an overview of appointments and key statistics.

### Appointments

Appointments are the core entity of the application:

1. **View Appointments**:

   - List view: Display all appointments with filtering and search capabilities
   - Detail view: Show comprehensive appointment details

2. **Appointment Management**:

   - Create appointments (coming soon)
   - Edit appointments
   - Delete appointments

3. **Appointment Properties**:
   - Title
   - Description
   - Start time
   - End time
   - Status (scheduled, completed, cancelled)
   - Category

### Calendar

The calendar view provides a visual representation of scheduled appointments.

### Categories

Categories help organize appointments:

1. **Category Properties**:

   - Name
   - Color
   - Description

2. **Category Usage**:
   - Visual distinction of appointment types
   - Filtering appointments by category

### User Profile

Users can view and manage their profile information:

1. **Profile Information**:
   - Name
   - Email
   - Avatar (from Google account)

## Technical Components

### Frontend Components

1. **Authentication Components**:

   - Protected routes that require authentication
   - Login page with Google authentication

2. **Layout Components**:

   - Header with navigation and user controls
   - Theme toggle (light/dark mode)

3. **UI Components**:
   - Cards for displaying information
   - Forms for data input
   - Buttons and interactive elements
   - Modals and dialogs
   - Loading states and skeletons

### API Structure

1. **Authentication Routes**:

   - Google OAuth endpoints
   - Logout endpoint

2. **Resource Routes**:

   - Appointments CRUD operations
   - Categories CRUD operations
   - User profile operations

3. **Protected Routes**:
   - All routes except authentication require valid token

## Limitations and Future Enhancements

1. **Current Limitations**:

   - Appointment creation functionality is marked as "Coming Soon"
   - Authorization policies are restrictive for certain operations

2. **Planned Features**:
   - Traditional email/password authentication
   - Appointment creation and management
   - Notification system
   - Calendar integrations

## Troubleshooting

### Common Issues

1. **Authentication Issues**:

   - Ensure Google credentials are properly configured
   - Check Sanctum configuration for session/token handling

2. **API Connection Issues**:
   - Verify CORS settings are correctly configured
   - Ensure API base URL is correctly set in the frontend

## Deployment

The application uses Docker for containerization and can be deployed using various CI/CD pipelines. When deploying:

1. Ensure proper Docker credentials for pushing images
2. Configure environment variables for production
3. Set up database migrations and seeders

## Development Guidelines

1. **Code Style**:

   - Follow Laravel coding standards for backend
   - Use TypeScript strict mode for frontend
   - Implement comprehensive error handling

2. **Testing**:

   - Write unit tests for critical backend functionality
   - Implement component testing for frontend

3. **Security**:
   - Validate all input data
   - Use proper authorization checks
   - Sanitize output to prevent XSS
