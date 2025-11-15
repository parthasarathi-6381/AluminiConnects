// controllers/userController.js
import User from "../models/User.js";
import Alumni  from "../models/alumni.js";
import admin from "../firebase/firebaseAdmin.js";
import { validateUserInput } from "../utils/validators.js";
export const createUser = async (req, res) => {
  console.log("Create user triggered");
  try {
    const { name, department, graduationYear } = req.body;
    if (!department || !graduationYear) {
      return res.status(400).json({ message: "Profile incomplete" });
    }

    const decoded = req.user;
    const { uid, email } = decoded;

    // Check duplicate in both collections
    const existingUser = await User.findOne({ uid });
    const existingAlumni = await Alumni.findOne({ uid });

    if (existingUser || existingAlumni) {
      return res.status(409).json({ message: "User already exists" });
    }

    // Determine role
    const emailDomain = email.split("@")[1];
    const isCollegeEmail = emailDomain === "citchennai.net";

    let role = isCollegeEmail ? "student" : "alumni";
    let verified = isCollegeEmail; // students auto-verified

    let newUser;

    if (role === "student") {
      newUser = new User({
        uid,
        email,
        name,
        department,
        graduationYear,
        role,
        verified,
      });
    } else {
      newUser = new Alumni({
        uid,
        email,
        name,
        department,
        graduationYear,
        role,
        verified,
      });
    }

    await newUser.save();

    // Set Firebase custom claims
    await admin.auth().setCustomUserClaims(uid, { role, verified });

    res.status(201).json({
      message: `${role} registered successfully`,
      user: newUser,
    });

  } catch (err) {
    console.error("Error creating user:", err);
    res.status(500).json({ message: "Error creating user", error: err.message });
  }
};


//  Get logged-in user profile
export const getProfile = async (req, res) => {
  try {
    const { uid } = req.params;

    if (!uid) {
      return res.status(400).json({ message: "UID is required" });
    }

    // Check if the requesting user is the same as the profile UID
    if (req.user.uid !== uid) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    // First check User (student)
    let user = await User.findOne({ uid });

    // If not found in User, check Alumni
    if (!user) {
      user = await Alumni.findOne({ uid });
    }

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);

  } catch (error) {
    console.error("Error fetching profile:", error);
    res.status(500).json({
      message: "Error fetching profile",
      error: error.message
    });
  }
};


// check existing user

export const checkExistingUser = async (req, res) => {
  console.log("check existing user is triggered!!");
  try {
    const { uid } = req.params;

    if (!uid) {
      return res.status(400).json({ message: "UID is required" });
    }

    // Search in both collections
    const user = await User.findOne({ uid });
    const alumni = await Alumni.findOne({ uid });

    const exists = !!user || !!alumni;

    res.json({ exists });

  } catch (err) {
    console.error("Error checking user:", err);
    res.status(500).json({
      message: "Error checking user",
      error: err.message
    });
  }
};
