// C:\Noore\api\order.js

const mongoose = require('mongoose');

const mongoURI = process.env.MONGO_URI;

let Order;
if (mongoURI) {
  mongoose.connect(mongoURI).catch(() => {});
  
  const orderSchema = new mongoose.Schema({
    user: Object,
    items: Array,
    total: Number,
    date: { type: Date, default: Date.now }
  });
  Order = mongoose.model('Order', orderSchema);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { user, items, total } = req.body;
    
    if (!user || !items || !total) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    if (Order) {
      const newOrder = new Order({ user, items, total });
      await newOrder.save();
    }

    res.status(200).json({ success: true, message: 'Order placed!' });
  } catch (error) {
    console.error('Order error:', error);
    res.status(500).json({ message: 'Server error' });
  }
}