const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  customer: {
    name: String,
    email: String,
    googleId: String,
  },
  products: [
    {
      name: String,
      price: Number,
    },
  ],
  total: Number,
  paymentStatus: {
    type: String,
    enum: ["pending", "paid", "verified"],
    default: "pending",
  },
  orderId: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Order", orderSchema);