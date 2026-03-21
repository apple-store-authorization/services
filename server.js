const express = require("express");
const cookieParser = require("cookie-parser");

const app = express();
app.use(cookieParser());

// 🔁 YOUR OFFERS
const offers = [
  "https://offer1.com",
  "https://offer2.com",
  "https://offer3.com",
  "https://offer4.com",
  "https://offer5.com",
  "https://offer6.com",
  "https://offer7.com",
  "https://offer8.com",
  "https://offer9.com",
  "https://offer10.com",
  "https://offer11.com",
  "https://offer12.com",
  "https://offer13.com",
  "https://offer14.com",
  "https://offer15.com",
  "https://offer16.com",
  "https://offer17.com",
  "https://offer18.com",
  "https://offer19.com",
  "https://offer20.com"
];

// 🔁 Counter
let currentIndex = 0;

app.get("/", (req, res) => {

  // ❌ Prevent caching
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0");
  res.setHeader("Pragma", "no-cache");

  let redirectUrl;

  // ✅ If user already assigned
  if (req.cookies.user_offer) {
    redirectUrl = req.cookies.user_offer;
  } else {

    redirectUrl = offers[currentIndex];

    currentIndex = (currentIndex + 1) % offers.length;

    // 🍪 Cookie (important for Cloudflare)
    res.cookie("user_offer", redirectUrl, {
      maxAge: 7 * 24 * 60 * 60 * 1000,
      httpOnly: false,
      secure: true,
      sameSite: "None"
    });
  }

  res.redirect(302, redirectUrl);
});

// 🌐 Port
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server running...");
});
