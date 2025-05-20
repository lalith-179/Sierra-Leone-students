require("dotenv").config();
const mongoose = require("mongoose");
const cors = require("cors");
const members = require("./routes/members");
const home = require("./routes/home");
const university = require("./routes/universities");
const admin = require("./routes/admin");
const express = require("express");
const app = express();
const path = require("path");
const fs = require("fs");

console.log("connect");

app.set("view engine", "pug");

const mongoUri = process.env.MONGODB_URI || "mongodb://localhost/slsu_ap";

// Ensure required directories exist
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Wait for MongoDB connection before starting server
const startServer = async () => {
  try {
    await mongoose.connect(mongoUri);
    console.log("Connected to MongoDB...");

    app.use(cors());
    app.use(express.json());

    // Health check route - must be before other routes
    app.get("/health", (req, res) => {
      res.status(200).json({ status: "ok" });
    });

    // API Routes
    app.use("/api/university", university);
    app.use("/api/members", members);
    app.use("/admin", admin);

    // Static files
    app.use("/uploads", express.static(uploadsDir));
    
    // Serve frontend static files in production
    const env = process.env.NODE_ENV || "development";
    if (env === "production") {
      console.log(
        "Running in production mode - serving frontend from:",
        path.join(__dirname, "../front-end/dist")
      );

      // Serve static files from the React app
      app.use(express.static(path.join(__dirname, "../front-end/dist")));
      app.use("/Images", express.static(path.join(__dirname, "../front-end/dist/Images")));

      // Handle React routing, return all requests to React app
      app.get("*", (req, res) => {
        if (
          !req.path.startsWith("/api") &&
          !req.path.startsWith("/uploads") &&
          !req.path.startsWith("/Images") &&
          !req.path.startsWith("/admin/export-csv") &&
          !req.path.startsWith("/admin/csv-raw")
        ) {
          console.log("Serving React app for path:", req.path);
          res.sendFile(path.join(__dirname, "../front-end/dist", "index.html"));
        }
      });
    } else {
      // Development routes
      app.use("/", home);
      app.use("/Images", express.static(path.join(__dirname, "../front-end/public/Images")));
    }

    const port = process.env.PORT || 5000;
    app.listen(port, () => {
      console.log(`Server running in ${env} mode on port ${port}`);
      if (env === "production") {
        console.log(
          "Frontend is being served from:",
          path.join(__dirname, "../front-end/dist")
        );
      }
    });
  } catch (err) {
    console.error("Could not connect to MongoDB:", err);
    process.exit(1);
  }
};

startServer();
