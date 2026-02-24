// C:\Noore\api\order.js

export default async function handler(req, res) {
  console.log('Order API called', req.method);
  
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { user, items, total, products } = req.body;
    console.log('Order received:', { user, items, total, products });

    res.status(200).json({ success: true, message: 'Order placed!' });
  } catch (error) {
    console.error('Order error:', error);
    res.status(500).json({ message: 'Server error' });
  }
}