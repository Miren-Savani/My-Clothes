import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import { sendMail } from "../config/mailer.js";
import { buildCancelHtml } from "../utils/cancelTemplate.js";
import { buildInvoiceHtml } from "../utils/invoiceTemplate.js";
import { buildDeliveryHtml } from "../utils/deliveryTemplate.js";
import Stripe from "stripe";

// global variables
const currency = 'usd';
const deliveryCharge = 10;
// simple coupon config; in production, fetch from DB
const coupons = {
    'SAVE10': { type: 'percent', value: 10 },
    'SAVE20': { type: 'percent', value: 20 }, // 10% off subtotal
    'FLAT50': { type: 'flat', value: 50 },    // $50 off subtotal
    'FREEDEL': { type: 'free_delivery', value: deliveryCharge }, // waive delivery
};

//gateway initlize
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Validate coupon and compute pricing breakdown
const validateCoupon = async (req, res) => {
    try {
        const { code, subtotal } = req.body;
        const trimmed = String(code || '').toUpperCase().trim();
        const sub = Number(subtotal) || 0;
        let discount = 0;
        let delivery = deliveryCharge;

        if (!trimmed || !coupons[trimmed]) {
            return res.json({ success: false, message: 'Invalid coupon code' });
        }

        if (trimmed && coupons[trimmed]) {
            const c = coupons[trimmed];
            if (c.type === 'percent') {
                discount = Math.floor((sub * c.value) / 100);
            } else if (c.type === 'flat') {
                discount = c.value;
            } else if (c.type === 'free_delivery') {
                delivery = 0;
            }
        }

        discount = Math.min(discount, sub); // cap
        const finalAmount = Math.max(0, sub - discount) + delivery;
        return res.json({ success: true, data: { code: trimmed, subtotal: sub, discount, delivery, amount: finalAmount } });
    } catch (error) {
        console.log(error);
        return res.json({ success: false, message: error.message });
    }
}

// Placing order using COD
const placeOrder = async(req, res) => {
    try{
        const { userId, items, amount, address, subtotal = 0, discount = 0, couponCode = '' } = req.body;

        // Basic address validation (in addition to schema validation)
        const a = address || {};
        const isSixDigitZip = /^\d{6}$/.test(String(a.zipcode || ''));
        const isTenDigitPhone = /^\d{10}$/.test(String(a.phone || ''));
        const isValidCountry = typeof a.country === 'string' && a.country.trim().length > 0;
        const isValidState = typeof a.state === 'string' && a.state.trim().length > 0;
        if (!isSixDigitZip || !isTenDigitPhone || !isValidCountry || !isValidState) {
            return res.json({ success:false, message:'Invalid address: zipcode must be 6 digits, phone must be 10 digits, country/state must be strings' });
        }
        const orderData = {
            userId,
            items,
            amount,
            subtotal,
            discount,
            couponCode,
            address,
            paymentMethod:"COD",
            payment:false,
            date:Date.now()
        }
        const newOrder = new orderModel(orderData);
        await newOrder.save();
        await userModel.findByIdAndUpdate(userId, {cartData:{}}); // Empty entered details after order placed

        // Best-effort confirmation email
        try {
            const user = await userModel.findById(userId).lean();
            if (user?.email) {
                const html = buildInvoiceHtml({ order: newOrder.toObject(), user });
                await sendMail({ to: user.email, subject: 'Order Confirmation', html });
            }
        } catch (mailErr) {
            console.log('Order confirmation email error (COD):', mailErr.message);
        }
        res.json({ success:true,message:"Order Placed Successfully" });
    }
    catch(error){
        console.log(error);
        res.json({ success:false, message:error.message });
    }
}

// Placing order using stripe method
const placeOrderStripe = async(req, res) => {
    try{
        const { userId, items, amount, address, subtotal = 0, discount = 0, couponCode = '' } = req.body;
        // Basic address validation (in addition to schema validation)
        const a = address || {};
        const isSixDigitZip = /^\d{6}$/.test(String(a.zipcode || ''));
        const isTenDigitPhone = /^\d{10}$/.test(String(a.phone || ''));
        const isValidCountry = typeof a.country === 'string' && a.country.trim().length > 0;
        const isValidState = typeof a.state === 'string' && a.state.trim().length > 0;
        if (!isSixDigitZip || !isTenDigitPhone || !isValidCountry || !isValidState) {
            return res.json({ success:false, message:'Invalid address: zipcode must be 6 digits, phone must be 10 digits, country/state must be strings' });
        }
        const { origin } = req.headers;
        const orderData = {
            userId,
            items,
            amount,
            subtotal,
            discount,
            couponCode,
            address,
            paymentMethod:"Stripe",
            payment:false,
            date:Date.now()
        }
        const newOrder = new orderModel(orderData);
        await newOrder.save();
        const line_items = items.map((item)=>({
            price_data : {
                currency : currency,
                product_data : {
                    name : item.name
                },
                unit_amount : item.price*100
            },
            quantity : item.quantity
        }));
        line_items.push({
            price_data : {
                currency : currency,
                product_data : {
                    name : "Delivery Charges"
                },
                unit_amount : deliveryCharge*100
            },
            quantity : 1
        });
        const session = await stripe.checkout.sessions.create({
            success_url : `${origin}/verify?session=true&orderId=${newOrder._id}`,
            cancel_url : `${origin}/verify?session=false&orderId=${newOrder._id}`,
            line_items,
            mode : 'payment',
        })

        res.json({ success:true, session_url:session.url });
    }
    catch(error){
        console.log(error);
        res.json({ success:false, message:error.message });
    }
}

// verify Stripe payment
const verifyStripe = async(req, res) => {
    const {orderId,success,userId} = req.body;
    try{
        if(success){
            await orderModel.findByIdAndUpdate(orderId, { payment:true });
            await userModel.findByIdAndUpdate(userId, {cartData:{}});

            // Best-effort confirmation email on successful payment
            try {
                const [order, user] = await Promise.all([
                    orderModel.findById(orderId).lean(),
                    userModel.findById(userId).lean(),
                ]);
                if (order && user?.email) {
                    const html = buildInvoiceHtml({ order, user });
                    await sendMail({ to: user.email, subject: 'Payment Successful - Order Confirmation', html });
                }
            } catch (mailErr) {
                console.log('Order confirmation email error (Stripe):', mailErr.message);
            }

            res.json({ success:true, message:"Payment Success" });
        }else{
            await orderModel.findByIdAndDelete(orderId);
            res.json({ success:false, message:"Payment Failed" });
        }
    }
    catch(error){
        console.log(error);
        res.json({ success:false, message:error.message });
    }
}

// Placing order using Razorpay
const placeOrderRazorpay = async(req, res) => {
    try{

    }
    catch(error){
        
    }
}

//------------------------------------------------------------

// All orders data for admin panel
const allOrders = async(req, res) => {
    try{
        const orders = await orderModel.find({});
        res.json({ success:true,orders });
    }
    catch(error){
        console.log(error);
        res.json({ success:false, message:error.message });
    }
} 

// User order data for frontend
const userOrders = async(req, res) => {
    try{
        const {userId}=req.body;
        const orders = await orderModel.find({userId});
        res.json({ success:true, orders });
    }
    catch(error){
        console.log(error);
        res.json({ success:false, message:error.message });
    }
}
 
// Update order status
const updateStatus = async(req, res) => {
     try{
        const { orderId, status } = req.body;
        
        // Get the order before updating to check if it's being marked as delivered
        const order = await orderModel.findById(orderId);
        if (!order) {
            return res.json({ success:false, message:"Order not found" });
        }

        // Update the order status
        // If status is being changed to "Delivered", also mark payment as completed for COD orders
        const updateData = { status };
        if (status === 'Delivered' && order.paymentMethod === 'COD') {
            updateData.payment = true;
        }
        await orderModel.findByIdAndUpdate(orderId, updateData);
        
        // If status is being changed to "Delivered", send delivery confirmation email
        if (status === 'Delivered') {
            try {
                const user = await userModel.findById(order.userId).lean();
                if (user?.email) {
                    // Get the updated order data (with payment status updated)
                    const updatedOrder = await orderModel.findById(orderId).lean();
                    const html = buildDeliveryHtml({ order: updatedOrder, user });
                    await sendMail({ 
                        to: user.email, 
                        subject: `🎉 Order #${String(orderId).slice(-6).toUpperCase()} Delivered Successfully!`, 
                        html 
                    });
                    console.log(`Delivery confirmation email sent to ${user.email} for order ${orderId}`);
                }
            } catch (mailErr) {
                console.log('Delivery confirmation email error:', mailErr.message);
                // Don't fail the status update if email fails
            }
        }
        
        res.json({ success:true, message:"Status Updated Successfully" });  
     }
     catch(error){
        console.log(error);
        res.json({ success:false, message:error.message });
     }
}

// Cancel order by user
const cancelOrder = async (req, res) => {
    try {
        const { userId, orderId } = req.body;
        if (!orderId) {
            return res.json({ success:false, message:"Order ID is required" });
        }

        const order = await orderModel.findById(orderId);
        if (!order) {
            return res.json({ success:false, message:"Order not found" });
        }
        if (String(order.userId) !== String(userId)) {
            return res.json({ success:false, message:"Not authorized to cancel this order" });
        }
        if (order.status === 'Cancelled') {
            return res.json({ success:true, message:"Order already cancelled" });
        }

        order.status = 'Cancelled';
        await order.save();

        // Send cancellation email (best-effort)
        try {
            const user = await userModel.findById(userId).lean();
            if (user?.email) {
                const html = buildCancelHtml({ order, user });
                await sendMail({ to: user.email, subject: 'Your order has been cancelled', html });
            }
        } catch (mailErr) {
            console.log('Cancel email error:', mailErr.message);
        }

        res.json({ success:true, message:'Order cancelled', order });
    }
    catch(error){
        console.log(error);
        res.json({ success:false, message:error.message });
    }
}

// Analytics endpoint for admin dashboard
const getAnalytics = async (req, res) => {
    try {
        // Get all orders
        const orders = await orderModel.find({}).lean();
        
        // Calculate summary statistics
        const totalOrders = orders.length;
        const successfulOrders = orders.filter(order => order.status !== 'Cancelled').length;
        const cancelledOrders = orders.filter(order => order.status === 'Cancelled').length;
        
        const totalRevenue = orders.reduce((sum, order) => {
            return order.status !== 'Cancelled' ? sum + order.amount : sum;
        }, 0);
        
        const cancelledRevenue = orders.reduce((sum, order) => {
            return order.status === 'Cancelled' ? sum + order.amount : sum;
        }, 0);
        
        const averageOrderValue = successfulOrders > 0 ? totalRevenue / successfulOrders : 0;
        
        // Calculate category-wise sales
        const categoryMap = new Map();
        const productMap = new Map();
        
        orders.forEach(order => {
            order.items.forEach(item => {
                const category = item.category || 'Uncategorized';
                const productName = item.name;
                const isCancelled = order.status === 'Cancelled';
                
                // Category analytics
                if (!categoryMap.has(category)) {
                    categoryMap.set(category, {
                        category,
                        revenue: 0,
                        orders: 0,
                        quantity: 0,
                        cancelledRevenue: 0,
                        cancelledOrders: 0,
                        cancelledQuantity: 0
                    });
                }
                
                const categoryData = categoryMap.get(category);
                if (isCancelled) {
                    categoryData.cancelledRevenue += item.price * item.quantity;
                    categoryData.cancelledOrders += 1;
                    categoryData.cancelledQuantity += item.quantity;
                } else {
                    categoryData.revenue += item.price * item.quantity;
                    categoryData.orders += 1;
                    categoryData.quantity += item.quantity;
                }
                
                // Product analytics
                if (!productMap.has(productName)) {
                    productMap.set(productName, {
                        name: productName,
                        category: item.category || 'Uncategorized',
                        revenue: 0,
                        orders: 0,
                        quantity: 0,
                        cancelledRevenue: 0,
                        cancelledOrders: 0,
                        cancelledQuantity: 0
                    });
                }
                
                const productData = productMap.get(productName);
                if (isCancelled) {
                    productData.cancelledRevenue += item.price * item.quantity;
                    productData.cancelledOrders += 1;
                    productData.cancelledQuantity += item.quantity;
                } else {
                    productData.revenue += item.price * item.quantity;
                    productData.orders += 1;
                    productData.quantity += item.quantity;
                }
            });
        });
        
        // Convert maps to arrays and sort
        const categorySales = Array.from(categoryMap.values()).sort((a, b) => 
            (b.revenue + b.cancelledRevenue) - (a.revenue + a.cancelledRevenue)
        );
        
        const topProducts = Array.from(productMap.values()).sort((a, b) => 
            (b.revenue + b.cancelledRevenue) - (a.revenue + a.cancelledRevenue)
        );
        
        const analytics = {
            summary: {
                totalRevenue,
                totalOrders,
                successfulOrders,
                cancelledOrders,
                averageOrderValue
            },
            categorySales,
            topProducts
        };
        
        res.json({ success: true, data: analytics });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

export { placeOrder, placeOrderStripe, placeOrderRazorpay, allOrders, userOrders, updateStatus, verifyStripe, cancelOrder, validateCoupon, getAnalytics };

