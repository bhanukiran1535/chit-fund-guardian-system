require('dotenv').config({debug:false});
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const ConnectDB = require("./config/mongoose");
const userRoute = require('./Routes/user');
const groupRoute = require('./Routes/group')
const monthRoute = require('./Routes/month')
const requestRoute = require('./Routes/request')
const cookieParser = require('cookie-parser');
const PaymentRouter = require('./Routes/payment');
const { generalLimiter } = require('./middlewares/rateLimiter');
const sanitizeInput = require('./middlewares/inputSanitizer');

let app = express();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:8080',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:8080',
  process.env.FRONTEND_ORIGIN
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  optionsSuccessStatus: 200
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
app.use(generalLimiter);
app.use(sanitizeInput);
ConnectDB();
app.use('/user',userRoute);
app.use('/group',groupRoute);
app.use('/month', monthRoute);
app.use('/request', requestRoute);
app.use('/payment', PaymentRouter);
const PORT = process.env.PORT || 3000;
const HOST = process.env.NODE_ENV === 'production' ? '0.0.0.0' : 'localhost';

app.listen(PORT, HOST, () => {
  console.log(`Server running on ${HOST}:${PORT}`);
});
