import express from 'express';
import { placeOrder, placeOrderStripe, placeOrderRazorpay, allOrders, userOrders, updateStatus, verifyStripe, cancelOrder, getAnalytics } from '../controllers/orderController.js';
import { validateCoupon } from '../controllers/orderController.js';
import adminAuth from '../middleware/adminAth.js';
import { authUser } from '../middleware/auth.js';

const orderRouter = express.Router();
 
// Admin features for orders
orderRouter.post('/list',adminAuth,allOrders);
orderRouter.post('/status',adminAuth,updateStatus);
orderRouter.get('/analytics',adminAuth,getAnalytics);

// Payement methods
orderRouter.post('/place',authUser,placeOrder);
orderRouter.post('/stripe',authUser,placeOrderStripe);
orderRouter.post('/razorpay',authUser,placeOrderRazorpay);

// User features for orders
orderRouter.post('/userorders',authUser,userOrders);
orderRouter.post('/cancel',authUser,cancelOrder);
orderRouter.post('/coupon/validate', authUser, validateCoupon);

//verify payment
orderRouter.post('/verify',authUser,verifyStripe);

export default orderRouter;