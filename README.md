# Meeting Room Reservation System

Minimal frontend and API scaffold for a meeting room reservation system.

Stack: React, TypeScript, Vite, React Router, Material UI, TanStack Query, native
Fetch, Oxlint, Prettier, ASP.NET Core, and EF Core InMemory.

Prerequisites: Node.js 22.12+, npm 10+, and the .NET 10 SDK on `PATH`.

Start the frontend:

```bash
cd frontend
npm install
npm run dev
```

Start the backend in a separate terminal:

```bash
cd backend
dotnet restore
dotnet run
```

Open http://localhost:5173 and click **Check backend connection**. The response
should be `{"status":"running"}` from http://localhost:5000/api/health.

To change the API URL, copy `frontend/.env.example` to `frontend/.env` and update
`VITE_API_URL`.
