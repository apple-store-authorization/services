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

// 🤖 SAFE BOT CHECK
function isBasicBot(req) {
  const ua = (req.headers["user-agent"] || "").toLowerCase();

  return (
    ua.includes("curl") ||
    ua.includes("wget") ||
    ua.includes("python") ||
    ua.includes("scrapy")
  );
}

// 💻 ALLOW ONLY WINDOWS + MAC DESKTOP
function isAllowedDesktop(req) {
  const ua = (req.headers["user-agent"] || "").toLowerCase();

  const isWindows = ua.includes("windows");
  const isMac = ua.includes("macintosh");

  const isMobile =
    ua.includes("iphone") ||
    ua.includes("android") ||
    ua.includes("ipad") ||
    ua.includes("mobile");

  return (isWindows || isMac) && !isMobile;
}

// 🚀 ENTRY ROUTE
app.get("/", (req, res) => {

  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0");
  res.setHeader("Pragma", "no-cache");

  // 🤖 block obvious bots
  if (isBasicBot(req)) {
    return res.redirect(302, "https://google.com");
  }

  // 💻 allow only desktop (Windows/Mac)
  if (!isAllowedDesktop(req)) {
    return res.send("Website Under Maintenance - this site is temporarily unavailable due to scheduled updates, repairs, or technical issues, aiming to improve performance or security.");
  }

  // continue
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
      webdriver: navigator.webdriver
    };

    fetch("/validate", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify(data)
    }).then(() => {
      window.location.href = "/go";
    }).catch(() => {
      window.location.href = "/go";
    });

    setTimeout(() => {
      window.location.href = "/go";
    }, 2000);
  </script>
  </body>
  </html>
  `);
});

// 🔍 VALIDATION
app.post("/validate", (req, res) => {
  const d = req.body;

  if (d.webdriver === true) {
    return res.status(403).end();
  }

  res.status(200).end();
});

// 🎯 ROTATION
app.get("/go", (req, res) => {

  let redirectUrl;

  if (req.cookies.user_offer) {
    redirectUrl = req.cookies.user_offer;
  } else {
    redirectUrl = offers[currentIndex];
    currentIndex = (currentIndex + 1) % offers.length;

    res.cookie("user_offer", redirectUrl, {
      maxAge: 7 * 24 * 60 * 60 * 1000,
      secure: true,
      sameSite: "None"
    });
  }

  // 📊 track
  stats[redirectUrl] = (stats[redirectUrl] || 0) + 1;

  res.redirect(302, redirectUrl);
});

// 📊 STATS (protected)
app.get("/stats", (req, res) => {
  if (req.query.key !== "admin123") {
    return res.status(403).send("Forbidden");
  }
  res.json(stats);
});

// 🌐 START
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Desktop-only rotator running...");
});
