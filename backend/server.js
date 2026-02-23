const express = require("express");
const session = require("express-session");
const path = require("path");
const mongoose = require("mongoose");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
require("dotenv").config();

const app = express();
const PORT = 5000;

/* ---------- MIDDLEWARE ---------- */

// Parse JSON bodies
app.use(express.json());

// Sessions
app.use(
  session({
    secret: "noore-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 }, // 1 hour
  })
);

// Passport Google OAuth
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/auth/google/callback",
    },
    (accessToken, refreshToken, profile, done) => {
      // store minimal info in session
      done(null, {
        id: profile.id,
        name: profile.displayName,
        email: profile.emails[0].value,
      });
    }
  )
);

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

app.use(passport.initialize());
app.use(passport.session());

/* ---------- MONGODB CONNECTION ---------- */

const mongoURI = process.env.MONGO_URI;
console.log("Mongo URI:", mongoURI);

mongoose
  .connect(mongoURI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

/* ---------- FRONTEND SERVING ---------- */

const frontendPath = path.join(__dirname, "../public");
app.use(express.static(frontendPath));

app.get("/", (req, res) => {
  res.sendFile(path.join(frontendPath, "index.html"));
});

/* ---------- HEALTH CHECK ---------- */
app.get("/api/health", (req, res) => {
  res.json({ status: "Noore backend running" });
});

/* ---------- AUTH ROUTES ---------- */

app.get(
  "/auth/google",
  (req, res, next) => {
      req.session.returnTo = req.query.from || "/";
      next();
  },
  passport.authenticate("google", { scope: ["profile", "email"] })
);

app.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/" }),
  (req, res) => {
      console.log("RETURN TO =", req.session.returnTo);
      res.redirect(req.session.returnTo || "/");
  }
);

// Check current user
app.get("/api/me", (req, res) => {
  if (req.session.passport && req.session.passport.user) {
    return res.json({ user: req.session.passport.user });
  }
  res.json({ user: null });
});

// Logout
app.get("/api/logout", (req, res) => {
  req.session.destroy(() => res.json({ success: true }));
});

/* ---------- PLACE ORDER ROUTE ---------- */
app.post("/api/order", (req, res) => {
  if (!req.session.passport || !req.session.passport.user)
    return res.status(401).json({ message: "Login required" });

  const order = req.body;
  console.log("Order placed by", req.session.passport.user.name, order);
  res.json({ success: true, order });
});

/* ---------- START SERVER ---------- */
app.listen(PORT, () => {
  console.log(`Noore backend running at http://localhost:${PORT}`);
});

