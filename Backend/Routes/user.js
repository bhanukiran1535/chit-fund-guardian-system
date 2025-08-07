// routes/user.js
const express = require('express');
const userRoute = express.Router();
const Otp = require("../Models/OTP");
const User = require("../Models/User");
const userAuth = require('../middlewares/userAuth');
const adminAuth = require('../middlewares/adminAuth');
const {sendOTP} = require('../Utils/OTPsender');
const { welcomeMail } = require('../Utils/WelcomeMail');
const { body, validationResult } = require('express-validator');

userRoute.post('/create',
  [
    body('firstName').trim().notEmpty().withMessage('First name is required'),
    body('email').isEmail().withMessage('Invalid email'),
    body('phoneNo').trim().notEmpty().withMessage('Phone number is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    try {
      const {password} = req.body;
      const newUser = new User(req.body);
      const passwordHash = await newUser.createpasswordHash(password);
      newUser.password = passwordHash; // Assign hashed password
      await newUser.save();  // insertOne is in MongoDB native
      welcomeMail(req.body.email,req.body.firstName);
    // const newUser = await User.create(req.body);  
      res.status(201).json({ success: true, user: { id: newUser._id, email: newUser.email, firstName: newUser.firstName } });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
});

userRoute.post('/verify-otp',
  [
    body('email').isEmail().withMessage('Invalid email'),
    body('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
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
userRoute.post('/send-otp',
  [body('email').isEmail().withMessage('Invalid email')],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
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
  console.error("Error sending email:", emailError.message);
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

userRoute.post('/login',
  [
    body('email').isEmail().withMessage('Invalid email'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
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

// Forgot password route
userRoute.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  
  try {
    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Generate a 6-digit OTP for password reset
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
    
    // Delete any existing OTPs for this email and create new one
    await Otp.deleteMany({ email });
    await Otp.create({ email, otp, expiry });
    
    try {
      // Send OTP via email
      await sendOTP(email, otp);
      console.log(`Password reset OTP sent to ${email}: ${otp}`);
    } catch (emailError) {
      console.error("Error sending email:", emailError.message);
      console.log(`Email sending failed, but OTP stored: ${otp} for ${email}`);
    }
    
    res.json({ success: true, message: 'Password reset OTP sent to email' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Request password reset (send OTP)
userRoute.post('/request-password-reset', [
  body('email').isEmail().withMessage('Invalid email'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    // Don't reveal if user exists
    return res.status(200).json({ success: true, message: 'If this email is registered, an OTP has been sent.' });
  }
  // Generate OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
  await Otp.deleteMany({ email });
  await Otp.create({ email, otp, expiry });
  try {
    await sendOTP(email, otp);
  } catch (emailError) {
    // Continue even if email fails
  }
  res.json({ success: true, message: 'If this email is registered, an OTP has been sent.' });
});

// Reset password
userRoute.post('/reset-password', [
  body('email').isEmail().withMessage('Invalid email'),
  body('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits'),
  body('newPassword').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  const { email, otp, newPassword } = req.body;
  const otpEntry = await Otp.findOne({ email });
  if (!otpEntry || otpEntry.otp !== otp) {
    return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
  }
  if (otpEntry.expiry < Date.now()) {
    await Otp.deleteOne({ email });
    return res.status(400).json({ success: false, message: 'OTP expired' });
  }
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }
  user.password = await user.createpasswordHash(newPassword);
  await user.save();
  await Otp.deleteOne({ email });
  res.json({ success: true, message: 'Password reset successful. You can now log in.' });
});

// Change password route (for logged-in users)
userRoute.post('/change-password', userAuth, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  
  try {
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Verify current password
    const isCurrentPasswordValid = await user.compareHash(currentPassword);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }
    
    // Hash and update new password
    const passwordHash = await user.createpasswordHash(newPassword);
    user.password = passwordHash;
    await user.save();
    
    res.json({ success: true, message: 'Password changed successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

userRoute.get('/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const user = await User.findById(userId).select('-password'); // exclude password

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    return res.status(200).json({ success: true, user });
  } catch (err) {
    console.error('Error fetching user:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// View audit logs (admin only)
userRoute.get('/audit-logs', userAuth, adminAuth, async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;
  try {
    const logs = await require('../Models/AuditLog')
      .find()
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit)
      .populate('performedBy', 'firstName email');
    const total = await require('../Models/AuditLog').countDocuments();
    res.json({ success: true, logs, total, page, limit });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = userRoute; // "wire it" to main Express app
