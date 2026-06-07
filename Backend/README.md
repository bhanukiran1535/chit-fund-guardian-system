# Backend - Chit Fund Guardian System

## Local setup

1. Copy `backend/.env.example` to `backend/.env`.
2. Fill in your backend secrets.
3. Install backend dependencies:

```bash
cd backend
npm install
```

4. Start the backend locally:

```bash
npm run dev
```

## Production deployment

Deploy the backend to a Node hosting provider.

Set the following environment variables in the host dashboard:

```text
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_at_least_32_characters
MAIL_USER=your_email_address
MAIL_PASS=your_email_password_or_app_password
PORT=3000
FRONTEND_ORIGIN=https://your-frontend-domain.com
NODE_ENV=production
```

- `FRONTEND_ORIGIN` must match the deployed frontend URL so backend CORS allows browser requests.
- `PORT` is usually provided by the host and should be used by the app.
- `JWT_SECRET` must be kept secret.

## Notes

- Do not commit `.env` files or secrets to git.
- The backend should be deployed separately from the frontend in this architecture.