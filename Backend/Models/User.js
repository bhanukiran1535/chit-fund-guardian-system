const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcrypt')
const jwt = require("jsonwebtoken")
const SECRET_KEY = process.env.JWT_SECRET;
const Counter = require('./Counter'); 

const UserSchema = mongoose.Schema({
 userId:{
  type: Number,
  unique:true,
  // required: true   // Remove `required: true`
 },
 password:{
  type: String,
  required: true
 },
 firstName:{
  type: String,
  required: true,
 },
 lastName:{
  type: String,
 },
alias:{
  type: String // ✅ Allows multiple docs with null/undefined
 },
 email:{
  type: String,
  required: true,
  // match: /.+\@.+\..+/,
  validate: {
    validator: validator.isEmail,
    message: "Invalid email format"
  }
 },
 phoneNo:{
  type: String,
  required: true,
 },
 isAdmin:{
  type: Boolean,
  default: false
 }
})
UserSchema.methods.getJWT = async function () {   // we can't use 'this' key word in arrow function
    const token = await jwt.sign({_id:this._id}, SECRET_KEY, { expiresIn: "15m" }); // Shorter lived access token
    return token;
};

UserSchema.methods.getRefreshToken = async function () {
    const crypto = require('crypto');
    const RefreshToken = require('./RefreshToken');
    
    // Generate secure random token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    
    // Store in database
    await RefreshToken.create({
        userId: this._id,
        token,
        expiresAt
    });
    
    return token;
};
UserSchema.methods.compareHash = async function (passwordInputedbyUser) {   // we can't use 'this' key word in arrow function
  const isPasswordValid =await bcrypt.compare(passwordInputedbyUser, this.password);
  return isPasswordValid;
};
UserSchema.methods.createpasswordHash = async function (newPassword) {   // we can't use 'this' key word in arrow function
  const passwordHash = await bcrypt.hash(newPassword, 12); // Increased salt rounds for better security
  return passwordHash;
};

UserSchema.pre('save', async function (next) {
  if (this.isNew) {
    const counter = await Counter.findOneAndUpdate(
      { name: 'userId' },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );
    this.userId = counter.seq;
  }
  next();
});

UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ alias: 1 }, { unique: true, sparse: true });
UserSchema.index({ isAdmin: 1 });

const UserModel = new mongoose.model('User',UserSchema);
module.exports = UserModel;