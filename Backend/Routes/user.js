// routes/user.js
const express = require('express');
const userRoute = express.Router();
const Otp = require("../Models/OTP");
const User = require("../Models/User");
const userAuth = require('../middlewares/userAuth');
const adminAuth = require('../middlewares/adminAuth');
const sendOTP = require('../Utils/OTPsender');


userRoute.post('/create', async (req, res) => {
  try {
    const {password} = req.body;
    const newUser = new User(req.body);
    const passwordHash = await newUser.createpasswordHash(password);
    newUser.password = passwordHash; // Assign hashed password
    await newUser.save();  // insertOne is in MongoDB native
  // const newUser = await User.create(req.body);  
    res.status(201).json({ success: true, user: newUser });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

userRoute.post('/verify-otp', async (req, res) => {
  const { email, otp } = req.body;

  const otpEntry = await Otp.findOne({ email });

  if (!otpEntry) {
    return res.status(400).json({ message: 'OTP not found' });
  }

  if (otpEntry.otp !== otp) {
    return res.status(400).json({ message: 'Invalid OTP' });
  }

  if (otpEntry.expiry < Date.now()) {
    await Otp.deleteOne({ email });
    return res.status(400).json({ message: 'OTP expired' });
  }
  
  await Otp.deleteOne({ email }); // Clean up
  res.status(200).json({ success: true, message: 'Email verified successfully' });
});




// send OTP route
userRoute.post('/send-otp', async (req, res) => {
  const { email } = req.body;
  
  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({ message: 'User already exists' });
  }
  
  // Generate a 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  
  const expiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
  
  await Otp.deleteMany({ email }); // delete any existing OTPs for this email
  await Otp.create({ email, otp, expiry });
  
  try {
    // Send OTP via email
    await sendOTP(email, otp);
    console.log(`OTP sent to ${email}: ${otp}`); // Keep console log for development
  } catch (emailError) {
    console.log(`Email sending failed, but OTP stored: ${otp} for ${email}`);
    // Continue even if email fails - OTP is still stored
  }
  
  res.json({ success: true, message: 'OTP sent to email' });
});

userRoute.get('/me', userAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    res.json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        isAdmin: user.isAdmin
      }
    });
  } catch (err) {
    res.status(401).json({ success: false, message: "Unauthorized" });
  }
});

userRoute.post('/login', async (req, res) => {
  try {
    const { password, email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    const isMatch = await user.compareHash(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    const token = await user.getJWT();
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
      maxAge: 3600000 // 1 hour
    });

    res.status(200).json({
      success: true,
      message: "Login successful",
      user: {
        id: user._id,
        firstName: user.firstName,
        email: user.email,
        isAdmin: user.isAdmin
      }
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

userRoute.get('/viewProfile',userAuth, async (req,res)=>{
  try{
    const ID = req.user._id;
    const info = await User.findById(ID);
    res.status(200).json({ 
      success: true, 
      message: "Account details",
      user: {
        id: info.userId,
        firstName: info.firstName,
        lastName: info.lastName,
        email: info.email,
        phoneNo: info.phoneNo,
      }});
  }catch(err){
    res.status(400).json({ success: false, message: err.message });
  }
})

userRoute.get('/logout', userAuth, async (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      sameSite: "Strict",
      secure: process.env.NODE_ENV === "production"
    });
    res.status(200).json({ success: true, message: "Logged out successfully" });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});


userRoute.delete('/delete',userAuth, async (req,res)=>{
  try{
    const ID = req.user._id;
    const info = await User.findByIdAndDelete(ID);
    res.status(200).json({ 
      success: true, 
      message: "This Profile Has been Deleted Successfully",
      user: {
        id: info._id,
        firstName: info.firstName,
        email: info.email,
        isAdmin: info.isAdmin
      }});
  }catch(err){
    res.status(400).json({ success: false, message: err.message });
  }
})

userRoute.get('/search', userAuth, adminAuth, async (req, res) => {
  const { query } = req.query;
  if (!query) {
    return res.status(400).json({ success: false, message: "Query required" });
  }

  try {
    const users = await User.find({
      $or: [
        { firstName: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } },
        { alias: { $regex: query, $options: 'i' } },
      ]
    }).select('_id firstName email alias');
    
    res.status(200).json({ success: true, users });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});


module.exports = userRoute; // "wire it" to main Express app
