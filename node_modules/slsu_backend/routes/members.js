const express = require("express");
const _ = require("lodash");
const { Member, validateMember } = require("../models/member");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Set up multer storage to save files in 'uploads' folder and keep original filename
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    // Sanitize filename and add timestamp
    const sanitizedFilename = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    cb(null, Date.now() + "-" + sanitizedFilename);
  },
});

// Configure multer to accept only PDF files
const upload = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    if (file.mimetype !== 'application/pdf') {
      return cb(new Error('Only PDF files are allowed!'), false);
    }
    cb(null, true);
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Serve uploaded files statically
router.use("/uploads", express.static(uploadsDir));

//Get all members
router.get("/", async (req, res) => {
  const member = await Member.find().sort("name");
  res.send(member);
});

//Get member by id
router.get("/:id", async (req, res) => {
  const member = await Member.findById(req.params.id);
  if (!member)
    return res
      .status(404)
      .send("The person with this id is not a registered member.");

  res.send(member);
});

//Creating a new Member
router.post("/", upload.single("letter"), async (req, res) => {
  console.log("Received registration POST");
  console.log("req.body:", req.body);
  console.log("req.file:", req.file);
  const { error } = validateMember(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  // Will also be handled by the frontend, already handled by mongoose schema for the backend
  const existingMember = await Member.findOne({ email: req.body.email });
  if (existingMember) {
    return res.status(400).send("Email is already registered");
  }

  // Build file URL if file uploaded
  let letterUrl = null;
  if (req.file) {
    // Assuming your backend is served from http://localhost:5000
    letterUrl = `${req.protocol}://${req.get("host")}/uploads/${
      req.file.filename
    }`;
  }

  let member = new Member({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
    universityType: req.body.universityType,
    universityName: req.body.universityName,
    otherUniversity: req.body.otherUniversity,
    levelOfEducation: req.body.levelOfEducation,
    course: req.body.course,
    letterUrl: letterUrl,
  });

  try {
    member = await member.save();
  } catch (ex) {
    console.log(ex);
    for (field in ex.errors) console.log(ex.errors[field].message);
    return res.status(400).send(ex.errors[field].message);
  }

  res.send(_.pick(member, ["name", "email", "letterUrl"]));
  console.log("Registration successful");
});

router.post("/login", async (req, res) => {
  // Simulate login logic (replace with real authentication as needed)
  const { email, password } = req.body;
  const member = await Member.findOne({ email, password });
  if (!member) {
    return res.status(400).send("Invalid email or password");
  }
  console.log("Registration successful");
  res.send({
    message: "Login successful",
    member: _.pick(member, ["name", "email"]),
  });
});

router.put("/:id", async (req, res) => {
  const { error } = validateMember(req.body);
  if (error) return res.status(400).send(error.details[0].message);
  const member = await Member.findByIdAndUpdate(
    req.params.id,
    { name: req.body.name, phone: req.body.phone },
    { new: true }
  );
  if (!member)
    return res
      .status(404)
      .send("The person with this id is not a registered member.");

  member.name = req.body.name;
  res.send(member);
});

router.delete("/:id", async (req, res) => {
  const member = await Member.findByIdAndDelete({ _id: req.params.id });
  if (!member)
    return res
      .status(404)
      .send("The person with this id is not a registered member.");

  res.send(member);
});

module.exports = router;

