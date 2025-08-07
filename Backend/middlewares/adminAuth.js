
const adminAuth = async (req,res,next)=>{
  try{
    if(!req.user.isAdmin){
      return res.status(403).json({ success: false, message: "You have no access for this action" });
    }
    next();
  }catch(err){
    return res.status(500).json({success:false,message:err.message});
  }
}

module.exports = adminAuth;