# StressScape

Full-stack app that combines **AQI**, **temperature (heat stress)**, and **crowd density** into a single **urban stress score**, visualized on an interactive map with layer toggles, authentication, analytics, and optional live weather.

## Architecture (3 layers)

1. **Frontend** — React (Vite), Tailwind CSS, Leaflet, Recharts (`frontend/`)
2. **Backend** — Node.js, Express, REST API (`backend/`)
3. **Database** — MongoDB via Mongoose (users, locations, saved-location relations)

## Stress engine

Each input is normalized to **0–100**, then:

`Stress = 0.4 × norm(AQI) + 0.3 × norm(Temperature) + 0.3 × norm(Crowd)`

- **AQI**: capped at 300 for normalization (MPCB-style bands inform interpretation).
- **Temperature**: stress rises as temperature moves away from a **26°C** comfort center.
- **Crowd**: already on **0–100**.

**Levels:** ≤33 low (green), ≤66 medium (yellow), higher = red.

## Folder structure

```
fsd_tisd/
├── backend/                 # Express API
│   ├── server.js
│   ├── src/
│   │   ├── config/          # DB
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/          # User, Location
│   │   ├── routes/
│   │   ├── services/        # stressEngine, weather, prediction
│   │   └── scripts/seed.js
│   └── package.json
├── frontend/                # React app
│   ├── src/
│   └── package.json
├── data/sample-locations.json
└── README.md
```

## Database schema

**User**

- `name`, `email` (unique), `password` (hashed), `role` (`user` | `admin`)
- `preferences.defaultLayers` — booleans for AQI, temperature, crowd, stress
- `savedLocations` — array of `ObjectId` → `Location`

**Location**

- `name`, `latitude`, `longitude`, `aqi`, `temperature`, `crowdDensity`
- `description`, `areaTag`, timestamps

## API routes

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/auth/register` | — | Sign up (JWT) |
| POST | `/api/auth/login` | — | Login |
| GET | `/api/auth/me` | User | Profile + saved locations |
| PATCH | `/api/auth/preferences` | User | Layer defaults |
| GET | `/api/locations` | — | All locations + stress fields |
| GET | `/api/locations/:id` | — | One location |
| POST | `/api/locations` | Admin | Create |
| PATCH | `/api/locations/:id` | Admin | Update |
| POST | `/api/locations/simulate-drift` | Admin | Random drift (real-time demo) |
| GET/POST | `/api/stress/calculate` | — | Stress from raw inputs |
| GET | `/api/analytics/summary` | — | Charts + aggregates |
| GET | `/api/predict/location/:id` | — | Heuristic 1h forecast |
| GET | `/api/weather/point?lat=&lon=` | — | OpenWeather (if `OPENWEATHER_API_KEY`) |
| GET | `/health` | — | Health check |

## Local setup

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)

### Backend

```bash
cd backend
cp .env.example .env
# Edit MONGODB_URI and JWT_SECRET
npm install
npm run seed
npm run dev
```

API: `http://localhost:5000`

**Demo logins (after seed)**

- Admin: `admin@stressscape.demo` / `admin123`
- User: `user@stressscape.demo` / `user123`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

App: `http://localhost:5173` (Vite proxies `/api` to port 5000.)

Production build: set `VITE_API_URL` to your deployed API URL (see `frontend/.env.example`).

## Advanced features included

- **Analytics dashboard** — distribution + bar charts (`/analytics`).
- **Simulated real-time drift** — admin-only API + optional 30s auto-refresh on map.
- **Role-based access** — admin for create/update/simulate; users for saved locations.
- **Third-party weather** — optional OpenWeatherMap air + weather at a point.

## Local setup

Refer to the documentation inside `frontend/` and `backend/` for detailed local setup instructions.

## Sample dataset

- **42 locations** inserted by `npm run seed` (Maharashtra-style mix).
- Static excerpt: `data/sample-locations.json`.

## Field visit note

Interpretation follows **MPCB-style AQI bands** and **construction-site / high–low crowd** observations; numeric values are **illustrative** for coursework and demos.
