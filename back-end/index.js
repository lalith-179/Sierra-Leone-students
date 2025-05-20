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
app.use("/", home);
app.use("/api/university", university);
app.use("/api/members", members);
app.use("/admin", admin);

// Serve frontend static files in production
env = process.env.NODE_ENV || "development";
if (env === "production") {
  const frontendPath = path.join(__dirname, "../front-end/dist");
  app.use(express.static(frontendPath));

  // Serve index.html for any unknown route (for React Router)
  app.get("*", (req, res) => {
    // Only serve index.html for non-API, non-upload routes
    if (
      !req.path.startsWith("/api") &&
      !req.path.startsWith("/uploads") &&
      !req.path.startsWith("/admin/export-csv") &&
      !req.path.startsWith("/admin/csv-raw")
    ) {
      res.sendFile(path.join(frontendPath, "index.html"));
    } else {
      res.status(404).send("Not found");
    }
  });
}

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Listening on port ${port}`));
