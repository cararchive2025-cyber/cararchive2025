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

/**
 * GET /images
 * Optional query parameter: tags (comma-separated)
 * Example: /images?tags=nature,forest
 */
app.get("/images", async (req, res) => {
  const tagsQuery = req.query.tags;

  if (!process.env.CLOUD_NAME || !process.env.API_KEY || !process.env.API_SECRET) {
    return res.status(500).json({ error: "Cloudinary environment variables not set" });
  }

  try {
    // Build the search expression
    let expression = "";
    if (tagsQuery) {
      const tags = tagsQuery.split(",").map((t) => t.trim());
      // Cloudinary search expression: AND all tags
      expression = tags.map((tag) => `tags:${tag}`).join(" AND ");
    }

    // Execute search, including tags in each result
    const result = await cloudinary.search
      .expression(expression)
      .max_results(100)
      .sort_by("public_id", "desc")
      .with_field("tags") // include tags in the response
      .execute();

    // Map results to include public_id, url, and associated tags
    const images = result.resources.map((img) => ({
      public_id: img.public_id,
      url: img.secure_url,
      tags: img.tags || [], // ensure tags is an array
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
