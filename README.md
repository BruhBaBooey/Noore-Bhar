# NOORÉ - Luxury Jewelry E-commerce

A luxury jewelry e-commerce website built with HTML, CSS, JavaScript, Node.js, Express, and MongoDB.

## Features

- Product catalog with categories (Bracelets, Rings, Arm Cuffs, Ear Cuffs, Chains)
- Shopping cart with localStorage persistence
- Google OAuth authentication
- UPI payment integration (QR code based)
- Order management via Google Sheets
- Mobile responsive design

## Running Locally

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or MongoDB Atlas)
- Google Cloud Console project (for OAuth)

### Setup Steps

1. **Install Dependencies**

```
bash
cd backend
npm install
```

2. **Configure Environment Variables**

Copy `.env` to `.env.local` and fill in your values:

```
bash
# Session Secret
SESSION_SECRET=your-random-secret-key

# MongoDB (use local or Atlas)
MONGO_URI=mongodb://localhost:27017/noore

# Google OAuth (get from Google Cloud Console)
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
```

3. **Start MongoDB**

```
bash
# If using local MongoDB
mongod
```

4. **Run the Server**

```
bash
cd backend
npm start
```

The app will run at `http://localhost:5000`

### For Development (with auto-restart)

```
bash
npm install -g nodemon
nodemon start
```

## Project Structure

```
Noore/
├── api/
│   └── server.js          # Express backend
├── backend/
│   ├── package.json       # Node dependencies
│   └── package-lock.json
├── public/
│   ├── index.html         # Homepage
│   ├── Collection.html    # Collections page
│   ├── Noore.css         # Homepage styles
│   ├── Collection.css    # Collections styles
│   ├── Background.png    # Hero image
│   ├── click.mp3        # Cart sound
│   └── trash.mp3        # Remove item sound
├── .env                 # Environment template
├── vercel.json          # Vercel deployment config
└── README.md
```

## Deployment

This project is configured for Vercel deployment. Simply push to GitHub and connect to Vercel.

### Vercel Environment Variables

Set these in Vercel dashboard:
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `MONGO_URI`
- `SESSION_SECRET`

## License

All Rights Reserved © 2026 NOORÉ Jewellery
