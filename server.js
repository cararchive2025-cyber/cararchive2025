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

// route to list all images
app.get("/images", async (req, res) => {
  try {
    // fetch up to 100 images (can paginate if needed)
    const result = await cloudinary.api.resources({
      type: "upload",
      resource_type: "image",
      max_results: 100,
    });

    // return only relevant info (URLs + public_ids)
    const images = result.resources.map(img => ({
      public_id: img.public_id,
      url: img.secure_url,
    }));

    res.json(images);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch images" });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://0.0.0.0:${port}`);
});
