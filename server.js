const express = require("express");
const cookieParser = require("cookie-parser");

const app = express();
app.use(cookieParser());
app.use(express.json());
app.set("trust proxy", 1);

// 🔁 YOUR OFFERS
const offers = [
  "https://offer1.com",
  "https://offer2.com",
  "https://offer3.com",
  "https://offer4.com",
  "https://offer5.com"
];

// 🔁 COUNTER
let currentIndex = 0;

// 📊 TRACKING
const stats = {};

// 🤖 SAFE BOT CHECK (LIGHT FILTER ONLY)
function isBasicBot(req) {
  const ua = (req.headers["user-agent"] || "").toLowerCase();

  const badBots = [
    "bot", "crawler", "spider", "curl", "wget",
    "python", "scrapy", "httpclient",
    "headless", "phantom", "selenium",
    "puppeteer", "playwright"
  ];

  return badBots.some(k => ua.includes(k));
}

// 🚀 ENTRY ROUTE
app.get("/", (req, res) => {

  // ❌ prevent caching
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0");
  res.setHeader("Pragma", "no-cache");

  // 🤖 basic bot filter only
  if (isBasicBot(req)) {
    return res.redirect(302, "https://google.com");
  }

  // go to fingerprint check
  res.redirect("/check");
});

// 🧠 FINGERPRINT PAGE
app.get("/check", (req, res) => {
  res.send(`
  <html>
  <body>
  <script>
    const data = {
      ua: navigator.userAgent,
      platform: navigator.platform,
      languages: navigator.languages,
      webdriver: navigator.webdriver,
      width: screen.width,
      height: screen.height
    };

    fetch("/validate", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify(data)
    }).then(() => {
      window.location.href = "/go";
    });
  </script>
  </body>
  </html>
  `);
});

// 🔍 VALIDATION (SAFE)
app.post("/validate", (req, res) => {
  const d = req.body;

  // block only clear automation
  if (d.webdriver === true) {
    return res.status(403).end();
  }

  res.status(200).end();
});

// 🎯 ROTATION
app.get("/go", (req, res) => {

  let redirectUrl;

  // ✅ returning user
  if (req.cookies.user_offer) {
    redirectUrl = req.cookies.user_offer;
  } else {

    // 🔁 round-robin
    redirectUrl = offers[currentIndex];
    currentIndex = (currentIndex + 1) % offers.length;

    // 🍪 save cookie
    res.cookie("user_offer", redirectUrl, {
      maxAge: 7 * 24 * 60 * 60 * 1000,
      secure: true,
      sameSite: "None"
    });
  }

  // 📊 track clicks
  stats[redirectUrl] = (stats[redirectUrl] || 0) + 1;

  // 🔁 redirect
  res.redirect(302, redirectUrl);
});

// 📊 VIEW STATS
app.get("/stats", (req, res) => {
  res.json(stats);
});

// 🌐 START SERVER
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Rotator running (safe mode)...");
});
