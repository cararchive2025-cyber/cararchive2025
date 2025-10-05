// server.js
const express = require("express");
const cloudinary = require("cloudinary").v2;

const app = express();
const port = process.env.PORT || 3000;

// configure cloudinary from environment variables
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

// health check route
app.get("/ping", (req, res) => {
  res.json({
    message: "Server is running",
    cloud_name: process.env.CLOUD_NAME || "not set",
  });
});

// list all images route
app.get("/images", async (req, res) => {
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

app.listen(port, () => {
  console.log(`✅ Server running at http://0.0.0.0:${port}`);
});
