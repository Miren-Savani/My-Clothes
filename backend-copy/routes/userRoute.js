import express from 'express';
import { loginUser,registerUser,adminLogin,getUserProfile,updateUserProfile,updateUserAddress,getUserOrders } from '../controllers/userController.js';
import { authUser } from '../middleware/auth.js';

const userRouter = express.Router();

userRouter.post('/register', registerUser);
userRouter.post('/login', loginUser);
userRouter.post('/admin', adminLogin);

// Protected routes - require authentication
userRouter.post('/profile', authUser, getUserProfile);
userRouter.put('/profile', authUser, updateUserProfile);
userRouter.put('/address', authUser, updateUserAddress);
userRouter.get('/orders', authUser, getUserOrders);

export default userRouter;