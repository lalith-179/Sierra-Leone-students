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

console.log("connect");

app.set("view engine", "pug");

const mongoUri = process.env.MONGODB_URI || "mongodb://localhost/slsu_ap";

mongoose
  .connect(mongoUri)
  .then(() => console.log("Connected to MongoDB..."))
  .catch((err) => console.error("Could not connect to MongoDB", err));

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Serve frontend static files in production BEFORE other routes
env = process.env.NODE_ENV || "development";
if (env === "production") {
  console.log(
    "Running in production mode - serving frontend from:",
    path.join(__dirname, "dist")
  );
  app.use(express.static(path.join(__dirname, "dist")));
}

// API Routes
app.use("/api/university", university);
app.use("/api/members", members);
app.use("/admin", admin);

// For development only
if (env !== "production") {
  app.use("/", home);
}

// Catch-all route for React Router in production
if (env === "production") {
  app.get("*", (req, res) => {
    if (!req.path.startsWith("/api") && !req.path.startsWith("/uploads")) {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    }
  });
}

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Listening on port ${port}`));
