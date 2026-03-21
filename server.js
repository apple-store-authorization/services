const express = require("express");
const fs = require("fs");
const cookieParser = require("cookie-parser");

const app = express();
app.use(cookieParser());

// 🔁 Your 20 URLs
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

const COUNTER_FILE = "counter.json";

// 🔧 Read index
function getIndex() {
  try {
    const data = JSON.parse(fs.readFileSync(COUNTER_FILE));
    return data.index || 0;
  } catch {
    return 0;
  }
}

// 🔧 Save index
function setIndex(i) {
  fs.writeFileSync(COUNTER_FILE, JSON.stringify({ index: i }));
}

// 🚀 Main route
app.get("/", (req, res) => {

  // ❌ Prevent caching
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0");
  res.setHeader("Pragma", "no-cache");

  let redirectUrl;

  // ✅ If user already has assigned offer
  if (req.cookies.user_offer) {
    redirectUrl = req.cookies.user_offer;
  } else {

    let index = getIndex();

    // assign next offer
    redirectUrl = offers[index];

    // update index
    index = (index + 1) % offers.length;
    setIndex(index);

    // save cookie (7 days)
    res.cookie("user_offer", redirectUrl, {
      maxAge: 7 * 24 * 60 * 60 * 1000,
      httpOnly: false,
      sameSite: "Lax"
    });
  }

  // 🔁 Redirect
  res.redirect(302, redirectUrl);
});

// 🌐 Port (Render requirement)
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
