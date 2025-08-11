require('dotenv').config({debug:false});
const express = require('express');
const cors = require('cors');
const ConnectDB = require("./config/mongoose");
const userRoute = require('./Routes/user');
const groupRoute = require('./Routes/group')
const monthRoute = require('./Routes/month')
const requestRoute = require('./Routes/request')
const cookieParser = require('cookie-parser');
const PaymentRouter = require('./Routes/payment');

let app = express();
app.use(cors({
  origin: process.env.FRONTEND_ORIGIN || 'http://localhost:5173', // Vite default port
  credentials: true
}));
app.use(express.json());  // to parse JSON body
app.use(cookieParser());
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
