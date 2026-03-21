const express = require("express");
const cookieParser = require("cookie-parser");

const app = express();
app.use(cookieParser());

app.set("trust proxy", 1);

// 🔁 YOUR OFFERS
const offers = [
  "https://offer1.com",
  "https://offer2.com",
  "https://offer3.com",
  "https://offer4.com",
  "https://offer5.com"
];

let currentIndex = 0;

// 🤖 BOT DETECTION FUNCTION
function isBot(req) {
  const ua = (req.headers["user-agent"] || "").toLowerCase();

  const botKeywords = [
    "bot", "crawler", "spider", "curl", "wget",
    "python", "scrapy", "httpclient",
    "headless", "phantom", "selenium",
    "puppeteer", "playwright"
  ];

  for (let keyword of botKeywords) {
    if (ua.includes(keyword)) return true;
  }

  // Missing important headers = suspicious
  if (!req.headers["accept-language"]) return true;

  return false;
}

// 🚀 MAIN ROUTE
app.get("/", (req, res) => {

  // ❌ Prevent caching
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0");
  res.setHeader("Pragma", "no-cache");

  // 🤖 BOT CHECK
  if (isBot(req)) {
    return res.redirect(302, "https://google.com"); // SAFE PAGE
  }

  let redirectUrl;

  // ✅ RETURNING USER
  if (req.cookies.user_offer) {
    redirectUrl = req.cookies.user_offer;
  } else {

    // 🔁 ROUND ROBIN
    redirectUrl = offers[currentIndex];
    currentIndex = (currentIndex + 1) % offers.length;

    // 🍪 COOKIE
    res.cookie("user_offer", redirectUrl, {
      maxAge: 7 * 24 * 60 * 60 * 1000,
      secure: true,
      sameSite: "None"
    });
  }

  // 🔁 REDIRECT
  res.redirect(302, redirectUrl);
});

// 🌐 START SERVER
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Bot-filter rotator running...");
});
