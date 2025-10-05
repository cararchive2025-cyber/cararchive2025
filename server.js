// server.js
require("dotenv").config();
const express = require("express");
const cloudinary = require("cloudinary").v2;
const path = require("path");

const app = express();
const port = process.env.PORT || 3000;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

// Serve static files from the 'public' folder
app.use(express.static(path.join(__dirname, "public")));

// Health check
app.get("/ping", (req, res) => {
  if (!process.env.CLOUD_NAME || !process.env.API_KEY || !process.env.API_SECRET) {
    return res.status(500).json({ error: "Cloudinary environment variables not set" });
  }
  res.json({ message: "Server is running", cloud_name: process.env.CLOUD_NAME });
});

// Images API
app.get("/images", async (req, res) => {
  const tagsQuery = req.query.tags;

  if (!process.env.CLOUD_NAME || !process.env.API_KEY || !process.env.API_SECRET) {
    return res.status(500).json({ error: "Cloudinary environment variables not set" });
  }

  try {
    let expression = "";
    if (tagsQuery) {
      const tags = tagsQuery.split(",").map((t) => t.trim());
      expression = tags.map((tag) => `tags:${tag}`).join(" AND ");
    }

    const result = await cloudinary.search
      .expression(expression)
      .max_results(100)
      .sort_by("public_id", "desc")
      .with_field("tags")
      .execute();

    const images = result.resources.map((img) => ({
      public_id: img.public_id,
      url: img.secure_url,
      tags: img.tags || [],
    }));

    res.json(images);
  } catch (err) {
    console.error("Cloudinary Search API error:", err);
    res.status(500).json({ error: err.message });
  }
});

// Start server
app.listen(port, () => {
  console.log(`✅ Server running at http://0.0.0.0:${port}`);
});
