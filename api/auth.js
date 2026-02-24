// C:\Noore\api\auth.js

export default function handler(req, res) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const callbackUrl = process.env.GOOGLE_CALLBACK_URL || 'https://noore-bhar.vercel.app/api/auth/callback';
  
  if (!clientId) {
    return res.status(500).json({ error: 'Google Client ID not configured' });
  }
  
  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(callbackUrl)}&response_type=code&scope=openid%20profile%20email&access_type=offline`;
  
  res.redirect(authUrl);
}