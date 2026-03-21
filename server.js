const express = require("express");
const cookieParser = require("cookie-parser");
const fetch = require("node-fetch");

const app = express();
app.use(cookieParser());
app.use(express.json());
app.set("trust proxy", 1);

// 🔁 OFFERS
const offers = [
  "https://offer1.com",
  "https://offer2.com",
  "https://offer3.com",
  "https://offer4.com",
  "https://offer5.com"
];

let currentIndex = 0;
const stats = {};

// 🤖 BOT CHECK
function isBasicBot(req) {
  const ua = (req.headers["user-agent"] || "").toLowerCase();

  const bad = [
    "bot","crawler","spider","curl","wget",
    "python","scrapy","httpclient",
    "headless","phantom","selenium",
    "puppeteer","playwright"
  ];

  if (bad.some(k => ua.includes(k))) return true;
  if (!req.headers["accept-language"]) return true;
  if (!req.headers["sec-ch-ua"]) return true;

  return false;
}

// 🌐 DATACENTER CHECK
async function isDatacenterIP(ip) {
  try {
    const res = await fetch(`http://ip-api.com/json/${ip}?fields=hosting,proxy`);
    const data = await res.json();
    return data.hosting || data.proxy;
  } catch {
    return false;
  }
}

// 🚀 ENTRY
app.get("/", async (req, res) => {

  res.setHeader("Cache-Control", "no-store");

  const ip = req.headers["x-forwarded-for"]?.split(",")[0] || req.socket.remoteAddress;

  if (isBasicBot(req) || await isDatacenterIP(ip)) {
    return res.redirect(302, "https://google.com");
  }

  res.redirect("/check");
});

// 🧠 FINGERPRINT PAGE
app.get("/check", (req, res) => {
  res.send(`
  <html><body>
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
  </body></html>
  `);
});

// 🔍 VALIDATE
app.post("/validate", (req, res) => {
  const d = req.body;

  if (d.webdriver === true) {
    return res.status(403).end();
  }

  res.status(200).end();
});

// 🎯 FINAL ROTATION
app.get("/go", (req, res) => {

  let redirectUrl;

  if (req.cookies.user_offer) {
    redirectUrl = req.cookies.user_offer;
  } else {
    redirectUrl = offers[currentIndex];
    currentIndex = (currentIndex + 1) % offers.length;

    res.cookie("user_offer", redirectUrl, {
      maxAge: 7 * 86400000,
      secure: true,
      sameSite: "None"
    });
  }

  stats[redirectUrl] = (stats[redirectUrl] || 0) + 1;

  res.redirect(302, redirectUrl);
});

// 📊 STATS
app.get("/stats", (req, res) => {
  res.json(stats);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("System running...");
});
