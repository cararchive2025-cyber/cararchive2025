// server.js
require("dotenv").config();
const express = require("express");
const cloudinary = require("cloudinary").v2;
const path = require("path");
const multer = require("multer");
const fs = require("fs");

const app = express();
const port = process.env.PORT || 3000;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Serve static files from 'public'
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Multer setup for file uploads
const upload = multer({ dest: "tmp/" });

// Health check
app.get("/ping", (req, res) => {
  res.json({ message: "Server is running", cloud_name: process.env.CLOUD_NAME });
});

// Images API
app.get("/images", async (req, res) => {
  const tagsQuery = req.query.tags;
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
      .execute();

    const images = await Promise.all(
      result.resources.map(async (img) => {
        const resource = await cloudinary.api.resource(img.public_id, { with_field: ["context"] });
        return {
          public_id: resource.public_id,
          url: resource.secure_url,
          tags: resource.tags || [],
          title: resource.context?.custom?.caption || resource.public_id,
          description: resource.context?.custom?.alt || "",
        };
      })
    );

    res.json(images);
  } catch (err) {
    console.error("Cloudinary API error:", err);
    res.status(500).json({ error: err.message });
  }
});

// Serve upload page
app.get("/upload", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "upload.html"));
});
app.get("/upload.html", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "upload.html"));
});

app.listen(port, () => {
  console.log(`✅ Server running at http://0.0.0.0:${port}`);
});
