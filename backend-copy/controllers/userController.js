import userModel from "../models/userModel.js";
import orderModel from "../models/orderModel.js";
import validator from "validator"; //for email validator
import bcrypt from "bcrypt"; //for password bcrypt
import jwt from 'jsonwebtoken'; //for token
import dotenv from 'dotenv';
dotenv.config();
// require('dotenv').config();


const createToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET);
};

// Route for user login-------------------------------------------------
const loginUser = async(req,res)=>{
    try{
        const {email,password} = req.body;
        const user = await userModel.findOne({email});
        if(!user){
            return res.json({message:"Invalid email"});
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if(isMatch){
            const token = createToken(user._id);
            return res.json({success:true, token});
        }else{
            return res.json({success:false, message:"Invalid password"});
        }
    }
    catch(error){
        console.log(error);
        res.json({success:false,message:error.message});
    }
}

// Route for user register-----------------------------------------------
const registerUser = async(req,res)=>{
    try{
        const {name,email,password} = req.body;

        //checking user already exist or not
        const exist = await userModel.findOne({email});
        if(exist){
            return res.json({success:false, message:"User already exist"});
        }

        // Validating email format & strong password
        if(!validator.isEmail(email)){
            return res.json({success:false, message:"Please enter a valid email"});
        }
        if(password.length < 8){
            return res.json({success:false, message:"Please enter a strong password(more then 8 characters)"});
        }

        // Hashing user password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        
        const newUser = new userModel({
            name,
            email,
            password:hashedPassword
        });
        const user = await newUser.save();
        const token = createToken(user._id); //token
        res.json({success:true,token});
    }
    catch(error){
        console.log(error);
        res.json({success:false,message:error.message});
    }
}

//Route for admin login------------------------------------------------
const adminLogin = async (req,res)=>{
    try{
        const {email,password} = req.body;
        if(email===process.env.ADMIN_EMAIL && password===process.env.ADMIN_PASSWORD){
            const token = jwt.sign(email+password, process.env.JWT_SECRET);
            res.json({success:true,token});
        } else{
            res.json({success:false,message:"Invaild credentials"});
        }
    }
    catch(error){
        console.log(error);
        res.json({success:false,message:error.message});
    }
}

// Route for getting user profile----------------------------------------
const getUserProfile = async(req,res)=>{
    try{
        const {userId} = req.body;
        const user = await userModel.findById(userId).select('-password');
        if(!user){
            return res.json({success:false, message:"User not found"});
        }
        
        // If createdAt doesn't exist (for old users), extract from ObjectId
        if (!user.createdAt) {
            // Extract creation date from MongoDB ObjectId
            const objectId = user._id;
            const timestamp = objectId.getTimestamp();
            user.createdAt = timestamp;
            // Save the createdAt field for future use
            await userModel.findByIdAndUpdate(userId, { createdAt: timestamp });
        }
        
        res.json({success:true, user});
    }
    catch(error){
        console.log(error);
        res.json({success:false,message:error.message});
    }
}

// Route for updating user profile--------------------------------------
const updateUserProfile = async(req,res)=>{
    try{
        const {userId} = req.body;
        const {name, email} = req.body;
        
        // Check if email is being changed and if it's already taken
        if(email){
            const existingUser = await userModel.findOne({email, _id: {$ne: userId}});
            if(existingUser){
                return res.json({success:false, message:"Email already exists"});
            }
        }

        const user = await userModel.findByIdAndUpdate(
            userId,
            {name, email},
            {new: true, runValidators: true}
        ).select('-password');

        if(!user){
            return res.json({success:false, message:"User not found"});
        }

        res.json({success:true, user, message:"Profile updated successfully"});
    }
    catch(error){
        console.log(error);
        res.json({success:false,message:error.message});
    }
}

// Route for updating user address--------------------------------------
const updateUserAddress = async(req,res)=>{
    try{
        const {userId} = req.body;
        const {address} = req.body;
        
        if(!address){
            return res.json({success:false, message:"Address is required"});
        }

        // Basic address validation
        const a = address || {};
        const isSixDigitZip = /^\d{6}$/.test(String(a.zipcode || ''));
        const isTenDigitPhone = /^\d{10}$/.test(String(a.phone || ''));
        const isValidCountry = typeof a.country === 'string' && a.country.trim().length > 0;
        const isValidState = typeof a.state === 'string' && a.state.trim().length > 0;
        
        if (!isSixDigitZip || !isTenDigitPhone || !isValidCountry || !isValidState) {
            return res.json({success:false, message:'Invalid address: zipcode must be 6 digits, phone must be 10 digits, country/state must be provided'});
        }

        const user = await userModel.findByIdAndUpdate(
            userId,
            {address, hasAddress: true},
            {new: true, runValidators: true}
        ).select('-password');

        if(!user){
            return res.json({success:false, message:"User not found"});
        }

        res.json({success:true, user, message:"Address updated successfully"});
    }
    catch(error){
        console.log(error);
        res.json({success:false,message:error.message});
    }
}

// Route for getting user orders----------------------------------------
const getUserOrders = async(req,res)=>{
    try{
        const {userId} = req.body;
        const orders = await orderModel.find({userId}).sort({createdAt: -1});
        res.json({success:true, orders});
    }
    catch(error){
        console.log(error);
        res.json({success:false,message:error.message});
    }
}

export { loginUser, registerUser, adminLogin, getUserProfile, updateUserProfile, updateUserAddress, getUserOrders };