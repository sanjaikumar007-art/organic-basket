const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// Serve the frontend (organic-basket.html renamed to index.html) as static files
app.use(express.static(__dirname));

// Load the QR traceability records from qr-trace.json
function loadTraceData() {
  const filePath = path.join(__dirname, "qr-trace.json");
  const raw = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(raw);
}

// GET /api/qr-trace?product=<name>
// This matches exactly what organic-basket.html's showQR() function calls.
app.get("/api/qr-trace", (req, res) => {
  const product = req.query.product;

  if (!product) {
    return res.status(400).json({ error: "Missing 'product' query parameter" });
  }

  const traceData = loadTraceData();
  const record = traceData[product];

  if (!record) {
    return res.status(404).json({ error: "No traceability record found for '" + product + "'" });
  }

  res.json(record);
});

// Load the customer reviews from reviews.json
function loadReviewsData() {
  const filePath = path.join(__dirname, "reviews.json");
  const raw = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(raw);
}

// GET /api/reviews?product=<name>
// Returns an array of { customer, rating, comment, date } for that product.
app.get("/api/reviews", (req, res) => {
  const product = req.query.product;

  if (!product) {
    return res.status(400).json({ error: "Missing 'product' query parameter" });
  }

  const reviewsData = loadReviewsData();
  const reviews = reviewsData[product] || [];

  res.json(reviews);
});

// Simple health check, handy for confirming the server is up
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Organic Basket backend running at http://localhost:${PORT}`);
  console.log(`Frontend:  http://localhost:${PORT}/index.html`);
  console.log(`API:       http://localhost:${PORT}/api/qr-trace?product=Tomatoes%20-%20Ravi%20Kumar`);
});
