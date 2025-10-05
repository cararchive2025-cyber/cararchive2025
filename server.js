// server.js
require("dotenv").config(); // Load .env variables at the very top
const express = require("express");
const cloudinary = require("cloudinary").v2;

const app = express();
const port = process.env.PORT || 3000;

// Configure Cloudinary from environment variables
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

// Health check route
app.get("/ping", (req, res) => {
  if (!process.env.CLOUD_NAME || !process.env.API_KEY || !process.env.API_SECRET) {
    return res.status(500).json({ error: "Cloudinary environment variables not set" });
  }
  res.json({
    message: "Server is running",
    cloud_name: process.env.CLOUD_NAME,
  });
});

// Route to list Cloudinary images
app.get("/images", async (req, res) => {
  if (!process.env.CLOUD_NAME || !process.env.API_KEY || !process.env.API_SECRET) {
    return res.status(500).json({ error: "Cloudinary environment variables not set" });
  }

  try {
    const result = await cloudinary.api.resources({
      type: "upload",
      resource_type: "image",
      max_results: 100,
    });

    const images = result.resources.map((img) => ({
      public_id: img.public_id,
      url: img.secure_url,
    }));

    res.json(images);
  } catch (err) {
    console.error("Cloudinary API error:", err);
    res.status(500).json({ error: err.message });
  }
});

// Start server
app.listen(port, () => {
  console.log(`✅ Server running at http://0.0.0.0:${port}`);
});
