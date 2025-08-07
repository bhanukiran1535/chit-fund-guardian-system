# Backend - Chit Fund Guardian System

## Security & Environment Setup

1. **Environment Variables**
   - Copy `.env.example` to `.env` and fill in your secrets:

```
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
MAIL_USER=your_gmail_address
MAIL_PASS=your_gmail_app_password
FRONTEND_ORIGIN=http://localhost:8080
```

2. **Security Features**
   - HTTP security headers via `helmet`
   - CSRF protection via `csurf`
   - Rate limiting on auth endpoints
   - Input validation and sanitization via `express-validator`
   - Sensitive data never sent in API responses

3. **Best Practices**
   - Never commit your `.env` file or secrets to version control.
   - Always use HTTPS in production. 