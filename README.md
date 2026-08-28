# Prestige Planner Frontend

Web application for the Prestige Planner event-management platform. The application supports public, attendee, organizer and administrator experiences and communicates with backend services only through the API Gateway.

## Technology

- React 19 and Vite 7
- React Router 7
- Axios
- Material UI and Tailwind CSS
- Chart.js, Recharts and FullCalendar

## Requirements

- Node.js 20 or newer
- npm
- Prestige Planner Gateway reachable from the browser

## Environment

Create a local `.env` file containing the Gateway origin:

```dotenv
VITE_API_URL=http://localhost:8080
```

The Axios client normalizes `/api/v1`; do not configure a direct service URL. Local `.env` files are ignored by Git and must not contain backend secrets.

## Commands

```powershell
npm ci
npm run dev
npm run lint
npm run build
npm run preview
```

The development server uses `http://localhost:5173` by default. Production output is generated in `dist/` and is not committed.

## Structure

```text
src/
├── assets/       Static images and video
├── components/   Shared UI, layouts and modals
├── lib/          Gateway Axios client
├── pages/        Public, attendee, organizer and admin pages
├── router/       Application routes
├── services/     Feature-level API clients
└── stores/       Authentication and theme state
```

All feature API clients must use `src/lib/axios.js`. Direct calls to Auth, User, Event, Ticket, Order, Payment, Notification, Marketplace, Chat or AI service addresses are forbidden.
