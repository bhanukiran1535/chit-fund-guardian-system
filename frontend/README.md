# Frontend - Chit Fund Guardian System

## Local setup

Install frontend dependencies and start the dev server:

```bash
cd frontend
npm install
npm run dev
```

## Production build

Build the static site:

```bash
cd frontend
npm run build
```

The generated static site is available in `frontend/dist`.

## Environment variables

Copy `frontend/.env.example` to `frontend/.env` for local development.

For production, set these environment variables in your hosting platform:

```text
VITE_API_BASE_URL=https://api.your-backend-domain.com
VITE_APP_NAME=Chit Fund Guardian
VITE_NODE_ENV=production
```

## Separate deployment approach

- Deploy `frontend/dist` to a static host such as Vercel, Netlify, Cloudflare Pages, or S3 + CloudFront.
- Set `VITE_API_BASE_URL` to your deployed backend API URL.
- Ensure your backend is deployed separately and allows CORS from `FRONTEND_ORIGIN`.

## Notes

- Do not commit `.env` files.
- `frontend/dist` is the build artifact to deploy.
- Backend API calls are routed via `VITE_API_BASE_URL`.
