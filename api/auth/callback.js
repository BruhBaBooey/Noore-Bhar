// C:\Noore\api\auth\callback.js

export default function handler(req, res) {
  const { code } = req.query;
  
  if (!code) {
    return res.status(400).json({ error: 'No code provided' });
  }
  
  // Redirect back to home with success
  res.redirect('/?auth=success');
}