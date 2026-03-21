const express = require("express");
const cookieParser = require("cookie-parser");
const fetch = require("node-fetch");

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

// 🧠 Simple in-memory rate tracking
const ipHits = {};

// 🔍 BOT CHECK
function isBasicBot(req) {
  const ua = (req.headers["user-agent"] || "").toLowerCase();

  const bad = [
    "bot","crawler","spider","curl","wget",
    "python","scrapy","httpclient",
    "headless","phantom","selenium",
    "puppeteer","playwright"
  ];

  if (bad.some(k => ua.includes(k))) return true;

  // Missing real browser headers
  if (!req.headers["accept-language"]) return true;
  if (!req.headers["sec-ch-ua"]) return true;

  return false;
}

// 🌐 DATACENTER IP CHECK (IP API)
async function isDatacenterIP(ip) {
  try {
    const res = await fetch(`http://ip-api.com/json/${ip}?fields=hosting,proxy`);
    const data = await res.json();

    return data.hosting === true || data.proxy === true;
  } catch {
    return false;
  }
}

// 🚫 RATE LIMIT CHECK
function isSuspiciousIP(ip) {
  const now = Date.now();

  if (!ipHits[ip]) ipHits[ip] = [];

  // keep last 10 hits
  ipHits[ip] = ipHits[ip].filter(t => now - t < 10000);
  ipHits[ip].push(now);

  return ipHits[ip].length > 10; // >10 hits in 10s
}

// 🚀 MAIN ROUTE
app.get("/", async (req, res) => {

  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0");
  res.setHeader("Pragma", "no-cache");

  const ip = req.headers["x-forwarded-for"]?.split(",")[0] || req.socket.remoteAddress;

  // 🔴 LAYER 1: Basic bot
  if (isBasicBot(req)) {
    return res.redirect(302, "https://google.com");
  }

  // 🔴 LAYER 2: Rate abuse
  if (isSuspiciousIP(ip)) {
    return res.redirect(302, "https://google.com");
  }

  // 🔴 LAYER 3: Datacenter / proxy
  if (await isDatacenterIP(ip)) {
    return res.redirect(302, "https://google.com");
  }

  // ✅ REAL USER → ROTATION
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

  res.redirect(302, redirectUrl);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Advanced rotator running...");
});
