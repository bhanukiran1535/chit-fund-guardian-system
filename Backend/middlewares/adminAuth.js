
const adminAuth = async (req,res,next)=>{
  try{
    if(!req.user.isAdmin){
      return res.status(404).json("You have no access for this action")
    }
    next();
  }catch(err){
    return res.status(404).json({success:false,message:err.message})
  }
}

module.exports = adminAuth;