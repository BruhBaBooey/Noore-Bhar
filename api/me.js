// C:\Noore\api\me.js

export default function handler(req, res) {
  // For now, return not logged in
  // The UPI payment modal will show even without login
  // If user is logged in via Firebase on frontend, you can check that instead
  res.status(200).json({ user: null });
}