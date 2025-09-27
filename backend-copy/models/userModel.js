// const mongoose = require("mongoose");
import mongoose from "mongoose";

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
}, { _id: false });

// Define the schema
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  cartData: { type: Object, default: {} },
  address: { type: addressSchema, required: false }, // Not required for existing users
  hasAddress: { type: Boolean, default: false }, // Track if user has provided address
}, {
  timestamps: true // This adds createdAt and updatedAt fields
});

// Ensure the model is not redefined
const userModel = (mongoose.models && mongoose.models.User) || mongoose.model("User", userSchema);

export default userModel;



// const mongoose = require("mongoose");

// // Define the schema
// const userSchema = new mongoose.Schema({
//   name: { type: String, required: true },
//   email: { type: String, required: true, unique: true },
//   password: { type: String, required: true },
//   cartData: { type: Object, default: {} },
// });

// // Ensure the model is not redefined
// // const userModel = mongoose.models.User || mongoose.model("User", userSchema);
// const userModel = (mongoose.models && mongoose.models.User) || mongoose.model("User", userSchema);

// export default userModel;

