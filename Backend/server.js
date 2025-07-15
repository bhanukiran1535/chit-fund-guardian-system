require('dotenv').config({debug:false});
const express = require('express');
const cors = require('cors');
const ConnectDB = require("./config/mongoose");
const userRoute = require('./Routes/user');
const groupRoute = require('./Routes/group')
const monthRoute = require('./Routes/month')
const requestRoute = require('./Routes/request')
const cookieParser = require('cookie-parser');

let app = express();
app.use(cors({
  origin: 'http://localhost:8080', // allow your frontend origin
  credentials: true               // allow cookies if you're using them
}));
app.use(express.json());  // to parse JSON body
app.use(cookieParser());
ConnectDB();
app.use('/user',userRoute);
app.use('/group',groupRoute);
app.use('/month', monthRoute);
app.use('/request', requestRoute);
app.listen(3000);
