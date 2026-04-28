# Travel Booking App (Frontend)

The frontend for the Travel Booking app. A React + TypeScript single-page app built with Vite and Tailwind CSS, where guests can browse properties, view details, book stays, and leave reviews, and hosts can sign in to manage listings.

## Tech stack

- **React 18** + **TypeScript**
- **Vite 6** — dev server and bundler
- **Tailwind CSS 3** — styling
- **React Router 6** — client-side routing
- **TanStack Query (React Query) 5** — server state and caching
- **Axios** — HTTP client
- **react-day-picker** + **date-fns** — date range picker for bookings
- **Sonner** — toast notifications
- **lucide-react** — icons

## Project layout

```
frontend/
├── src/                # components, pages, hooks, api client
├── index.html
├── package.json
├── vite.config.ts
├── tailwind.config.ts
├── tsconfig*.json
├── vercel.json         # Vercel deployment config
└── .env.example        # copy to .env and fill in values
```

## How to run it

### 1. Install Node.js

Use Node 18 or newer.

### 2. Install dependencies

From the `frontend/` folder:

```bash
npm install
```

### 3. Configure environment variables

Copy the example file and fill it in:

```bash
cp .env.example .env
```

The only variable is:

- `VITE_API_URL` — base URL of the backend API.
  - Local dev: `http://localhost:8000`
  - Production: your Render URL, e.g. `https://travel-api.onrender.com`

> Vite only exposes variables prefixed with `VITE_` to the client bundle.

### 4. Start the dev server

```bash
npm run dev
```

The app will be available at **http://localhost:5173**.

Make sure the backend is also running (see the backend README) so the frontend can talk to it.

### Demo login

Once the database has been seeded, you can sign in with the demo host:

- **Email:** `demo@stay.com`
- **Password:** `DemoHost123!`

## Available scripts

| Script | What it does |
|---|---|
| `npm run dev` | Start the Vite dev server with hot reload |
| `npm run build` | Type-check and produce a production build in `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | Run TypeScript in no-emit mode as a type check |

## Deploying

Designed to deploy to **Vercel**. Set `VITE_API_URL` in the Vercel dashboard (Project → Settings → Environment Variables) and point it at your deployed backend. The included `vercel.json` handles SPA routing.
