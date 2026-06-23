# StayTrack - Hostel Management System

A modern web application for managing hostel operations with separate interfaces for administrators and students.

## Features

- Admin dashboard for room management, attendance tracking, complaints, and notifications
- Student portal for registration, attendance, complaints, and profile management
- Responsive design supporting both iOS and Android devices
- Real-time SMS notifications via Twilio
- Secure authentication with JWT tokens

## Setup Instructions

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. **Backend Setup:**
   ```bash
   cd backend
   npm install
   npm run dev
   ```
   The backend will start on `http://localhost:8080` and be accessible on the network.

2. **Frontend Setup:**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   The frontend will start on `http://localhost:5173` and be accessible on the network (e.g., `http://192.168.x.x:5173`).

### Mobile Access

- Connect your iOS/Android device to the same WiFi network as the server
- Access the frontend URL from your mobile browser
- The app is fully responsive and optimized for mobile devices

### Database

The application uses SQLite via sql.js. The database is automatically seeded on startup.

## Development

- Backend API endpoints are available at `/api/*`
- Frontend uses React with Tailwind CSS for styling
- Hot reload is enabled for both frontend and backend during development

## Production Build

```bash
cd frontend
npm run build
npm run preview
```

## Technologies Used

- **Frontend:** React, Vite, Tailwind CSS, React Router
- **Backend:** Node.js, Express, SQLite, JWT, Twilio
- **Deployment:** Ready for any static hosting with API backend
