const jwt = require('jsonwebtoken');
const User = require('../Models/User');
const securityKey = process.env.JWT_SECRET;

const userAuth = async (req,res,next)=>{
  try{
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ success: false, message: "Currently you are not logged in" });
    
    const decodedmessage = await jwt.verify(token,securityKey); // "message": "jwt must be provided" - by default this res is send if verification fails here
    if(!decodedmessage) return res.status(401).json({ success: false, message: "Please login" });
    
    const { _id } = decodedmessage;
    const user = await User.findById(_id); 
    if(!user) return res.status(404).json({ success: false, message: "User not found" });
    
    req.user = user;
    next();
  }catch(err){
    return res.status(500).json({ success:false, message:err.message });
    // ( throw new ERR_HTTP_HEADERS_SENT('set'); 
    // Cannot set headers after they are sent to the client)
    // It means you're trying to send a response more than once
    // because if you do not use return after res.status(...), execution may continue in the route handler.
    // so,Once a response is sent, Node.js won't allow you to send headers (status, cookies, etc.) again.
  }
}
module.exports = userAuth;