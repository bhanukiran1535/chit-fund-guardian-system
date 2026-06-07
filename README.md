# 💼 MS-chitfunds-webapp

A fullstack MERN-based web application to manage chit funds, designed with admin and user flows in mind.

## 📦 Installation

Install dependencies for both apps from the repository root:

```bash
npm install
```

This will install the frontend and backend dependencies using npm workspaces.

## 🚀 Local development

Run both apps together locally:

```bash
npm run dev
```

Or run each app separately:

```bash
cd frontend
npm install
npm run dev
```

```bash
cd backend
npm install
npm run dev
```

## � How this works

- `frontend/` is the React app. In production it is built into static files under `frontend/dist`.
- `backend/` is the Express API server.
- `npm run dev` at the root starts both apps for development.
- In production, the frontend is a static site and the backend is a separate API service.
- The frontend uses `VITE_API_BASE_URL` to call the backend API.
- The backend uses `FRONTEND_ORIGIN` to allow browser requests from the frontend domain.

If you see `api.example.com`, that is only a placeholder. You must replace it with your real backend URL and rebuild the frontend.

## �🧩 Build frontend for production

From the repo root:

```bash
npm run build:frontend
```

The production build output is generated at `frontend/dist`.

## 🌐 Separate deployment strategy

### Frontend

- Deploy `frontend/dist` to a static host: Vercel, Netlify, Cloudflare Pages, S3 + CloudFront, or AWS Amplify.
- Set the production API URL in the host environment: `VITE_API_BASE_URL=https://your-backend-url.com`
- This value is built into the frontend at build time.

### Backend

- Deploy `backend/` to a Node host: AWS EC2, AWS App Runner, AWS Elastic Beanstalk, Render, Fly, Heroku, DigitalOcean App Platform, etc.
- Configure these environment variables in the host dashboard:

```text
MONGODB_URI=
JWT_SECRET=
MAIL_USER=
MAIL_PASS=
PORT=3000
FRONTEND_ORIGIN=https://your-frontend-domain.com
NODE_ENV=production
```

- `FRONTEND_ORIGIN` must match the deployed frontend URL so backend CORS allows browser requests.
- The backend should be accessible by the frontend URL set in `VITE_API_BASE_URL`.

### AWS example with public IP

- If backend runs on AWS EC2 and the public IP is `54.123.45.67`, set:
  - `VITE_API_BASE_URL=http://54.123.45.67:3000` in frontend host
  - `FRONTEND_ORIGIN=https://your-frontend-domain.com` in backend env
- If using HTTPS with a real domain, set the real domain instead of the raw IP.
- Make sure your EC2 security group allows inbound traffic on the chosen `PORT`.

### Why your browser fails on `api.example.com`

- `api.example.com` is a placeholder, not a real server.
- The frontend build must use the actual backend URL.
- If `VITE_API_BASE_URL` is wrong, the app cannot reach `/user/me`, `/user/login`, and other API routes.

## 📌 Notes

- Do not commit `.env` files.
- Use `frontend/.env.example` and `backend/.env.example` as templates.
- `frontend/dist` is the static build output; `backend/` is the API server.