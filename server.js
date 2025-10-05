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
ap
