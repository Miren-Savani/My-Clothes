import jwt from 'jsonwebtoken'
 
const adminAuth = async(req,res,next)=>{ //next is callback
    try{
        const { token } = req.headers;
        if(!token){
            return res.json({success:false, message:"hii"});
        }
        const token_decode = jwt.verify(token, process.env.JWT_SECRET);
        if(token_decode !== process.env.ADMIN_EMAIL + process.env.ADMIN_PASSWORD){
            return res.json({success:false, message:"Not authorized!"});
        }
        next();
    }
    catch(error){
        console.log(error);
        res.json({success:false,message:"Error in admin adth : "+error.message});
    }
}

export default adminAuth;