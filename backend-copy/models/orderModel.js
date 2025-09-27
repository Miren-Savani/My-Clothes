import mongoose from 'mongoose';

// Address sub-schema with validations
const addressSchema = new mongoose.Schema({
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true },
    street: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    zipcode: {
        type: String,
        required: true,
        trim: true,
        validate: {
            validator: (v) => /^\d{6}$/.test(String(v || '')),
            message: 'Zipcode must be exactly 6 digits',
        },
    },
    country: { type: String, required: true, trim: true },
    phone: {
        type: String,
        required: true,
        trim: true,
        validate: {
            validator: (v) => /^\d{10}$/.test(String(v || '')),
            message: 'Phone must be exactly 10 digits',
        },
    },
},{ _id:false });

const orderSchema = new mongoose.Schema({
    userId : { type:String, required:true },
    items : { type:Array, required:true },
    // final amount charged after discount and delivery
    amount : { type:Number, required:true },
    // additional pricing breakdown
    subtotal : { type:Number, required:false, default:0 },
    discount : { type:Number, required:false, default:0 },
    couponCode : { type:String, required:false, default:'' },
    address : { type: addressSchema, required:true },
    status : { type:String, required:true, default:'Order Placed' },
    paymentMethod : { type:String, required:true, default:'COD' },
    payment : { type:Boolean, required:true, default:false },
    date : { type:Number, required:true }
});

const orderModel = mongoose.models.order || mongoose.model('order', orderSchema);

export default orderModel;