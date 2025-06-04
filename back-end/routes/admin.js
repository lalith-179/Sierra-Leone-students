const express = require("express");
const router = express.Router();
const { Member } = require("../models/member");
const { Parser } = require("json2csv");
const fs = require("fs");
const path = require("path");

// GET /admin/export-csv - Export all members to CSV and serve the file
router.get("/export-csv", async (req, res) => {
  try {
    const members = await Member.find().lean();
    if (!members || members.length === 0) {
      return res.status(404).send("No members found");
    }
    // Only include relevant fields for CSV
    const fields = [
      "name",
      "email",
      "universityType",
      "universityName",
      "otherUniversity",
      "levelOfEducation",
      "course",
      "letterUrl",
    ];
    const opts = { fields };
    const parser = new Parser(opts);
    const csv = parser.parse(members);
    const csvPath = path.join(__dirname, "../uploads/members.csv");
    fs.writeFileSync(csvPath, csv);
    res.download(csvPath, "members.csv");
  } catch (err) {
    console.error(err);
    res.status(500).send("Failed to export members to CSV");
  }
});

// GET /admin/csv-raw - Return CSV as plain text for frontend table display
router.get("/csv-raw", async (req, res) => {
  try {
    const members = await Member.find().lean();
    console.log("/admin/csv-raw called. Members found:", members.length);
    if (!members || members.length === 0) {
      console.log("No members found for CSV export.");
      return res.status(404).send("No members found");
    }
    const fields = [
      "name",
      "email",
      "universityType",
      "universityName",
      "otherUniversity",
      "levelOfEducation",
      "course",
      "letterUrl",
    ];
    const opts = { fields };
    const parser = new Parser(opts);
    const csv = parser.parse(members);
    console.log("CSV output:\n", csv);
    res.header("Content-Type", "text/csv");
    res.send(csv);
  } catch (err) {
    console.error("Error in /admin/csv-raw:", err);
    res.status(500).send("Failed to export members to CSV");
  }
});

module.exports = router;
