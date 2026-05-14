# KreamZ Hub Manager

Ice cream van management system for **KreamZ** - Lusaka, Zambia.

Manage your fleet of ice cream vans, schedule locations, and track their live positions on Google Maps.

## Features

- 🚚 **Van Management** - Add, activate, and manage ice cream vans
- 📍 **Location Scheduling** - Set weekly schedules with GPS coordinates
- 🗺️ **Live Map View** - Track van locations in real-time using Google Maps
- 🔐 **Admin Authentication** - Secure login for van owners
- 📱 **Responsive Design** - Works on mobile and desktop

## Tech Stack

- **Frontend:** React 18 + TypeScript + Vite
- **Styling:** Tailwind CSS + shadcn/ui
- **Backend:** Firebase (Firestore + Authentication)
- **Maps:** Google Maps API
- **State Management:** React Query (TanStack Query)
- **Routing:** React Router v6

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Firebase project (created at console.firebase.google.com)
- Google Maps API key

### Installation

```bash
# Install dependencies
npm install

# Set up environment variables
# Create a .env file with Firebase config from console.firebase.google.com:
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_key
```

### Firebase Setup

1. Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable **Firestore Database** (start in test mode for development)
3. Enable **Authentication** → Email/Password provider
4. Get your Firebase config from Project Settings
5. Copy values to `.env` file above

### Development

```bash
npm run dev
```

Starts dev server at `http://localhost:8080`

### Build

```bash
npm run build
```

Creates optimized production build in `dist/` directory.

## Project Structure

```
src/
├── pages/              # Route pages (Index, Auth, Dashboard, NotFound)
├── components/
│   ├── ui/            # Reusable UI components (Button, Card, Input, etc.)
│   ├── dashboard/     # Dashboard-specific components (VanManagement, ScheduleManagement)
│   ├── Navigation.tsx # Main navbar
│   ├── Hero.tsx       # Landing page hero section
│   └── VanLocations.tsx # Van display with map integration
├── hooks/             # Custom React hooks (useAuth, useUserRole, useGoogleMapsKey)
├── contexts/          # AuthContext for authentication
├── integrations/
│   └── firebase/      # Firebase client config and Firestore operations
├── App.tsx            # Main app with routing
└── main.tsx           # Entry point
```

## Key Components

### Authentication
- Login/signup for van owners and admins
- Session management via Firebase Authentication
- Protected dashboard routes

### Van Management
- Create, read, update, delete ice cream vans
- Set van status (active/inactive)
- Display van information with images

### Schedule Management
- Create weekly schedules for each van
- Set location, time, and GPS coordinates
- Google Maps autocomplete for location selection

### Map Display
- Real-time van locations on public landing page
- Interactive map with marker filtering
- Today's schedule view and weekly schedule view

## Environment Variables

```
VITE_FIREBASE_API_KEY              # Firebase API key
VITE_FIREBASE_AUTH_DOMAIN          # Firebase auth domain
VITE_FIREBASE_PROJECT_ID           # Firebase project ID
VITE_FIREBASE_STORAGE_BUCKET       # Firebase storage bucket
VITE_FIREBASE_MESSAGING_SENDER_ID  # Firebase messaging sender ID
VITE_FIREBASE_APP_ID               # Firebase app ID
VITE_GOOGLE_MAPS_API_KEY           # Google Maps JavaScript API key
```

## Firestore Collections

### ice_cream_vans
- `name` - Van name
- `phone` - Contact phone number
- `status` - active | inactive | maintenance
- `currentLocation` - {lat, lng} for real-time tracking
- `createdAt` - Timestamp
- `updatedAt` - Timestamp

### van_schedules
- `vanId` - Reference to ice_cream_vans
- `location` - Location name/address
- `dayOfWeek` - 0-6 (Sunday-Saturday)
- `startTime` - HH:mm format
- `endTime` - HH:mm format
- `createdAt` - Timestamp
- `updatedAt` - Timestamp

### user_roles
- `userId` - Firebase auth user ID
- `role` - owner | admin | user
- `createdAt` - Timestamp

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint

## Deployment

The easiest way to deploy is to use:

- **Netlify** - Connect your GitHub repo, builds automatically
- **Vercel** - Similar to Netlify, optimized for Vite apps
- **Any static host** - Build locally with `npm run build` and upload `dist/` folder

Ensure your hosting platform has access to your environment variables.

## Contributing

Edit files in `src/` and changes will reflect instantly in development mode.

## Support

For questions or bugs, check the component files and hooks - the code is structured to be simple and easy to understand.
