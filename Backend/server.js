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
const paymentInstructionRoute = require('./Routes/paymentInstruction');
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

// CORS = "Which FRONTEND origins are allowed to call my BACKEND?"
const allowedOrigins = [
  'http://localhost:5000',
  'http://localhost:8080',
  process.env.FRONTEND_ORIGIN
].filter(Boolean);

const isAllowedOrigin = origin => {
  if (!origin) return false;
  try {
    const url = new URL(origin);
    const host = url.hostname;

    if (host === 'localhost' || host === '127.0.0.1') return true;
    if (/^172\.(16|17|18|19|20)\.[0-9]{1,3}\.[0-9]{1,3}$/.test(host)) return true;
    // Allow Replit dev domains
    if (host.endsWith('.replit.dev') || host.endsWith('.repl.co') || host.endsWith('.replit.app')) return true;
    return false;
  } catch (err) {
    return false;
  }
};

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin) || isAllowedOrigin(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  optionsSuccessStatus: 200
}));

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(generalLimiter);
app.use(sanitizeInput);
ConnectDB();
app.use('/user',userRoute);
app.use('/group',groupRoute);
app.use('/month', monthRoute);
app.use('/request', requestRoute);
app.use('/payment', PaymentRouter);
app.use('/payment-instruction', paymentInstructionRoute);

const PORT = process.env.PORT || 3000;
const HOST = 'localhost';

app.listen(PORT, HOST, () => {
  console.log(`Server running on ${HOST}:${PORT}`);
});
