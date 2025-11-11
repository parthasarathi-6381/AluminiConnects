// controllers/userController.js
import User from "../models/User.js";
import admin from "../firebase/firebaseAdmin.js";

export const createUser = async (req, res) => {
  try {
    const { name, department, graduationYear } = req.body;
     const decoded = req.user;  //  decoded Firebase token from middleware
    const { uid, email } = decoded;
    const existingUser = await User.findOne({ email});
    if (existingUser) {
       return res.status(409).json({ message: "User already exists" });
        }
    //  Determine user type based on email domain
    const emailDomain = email.split("@")[1];
    const isCollegeEmail = emailDomain === "citchennai.net"; // change to your domain

    let role = "alumni";  
    let verified = false;

    if (isCollegeEmail) {
      role = "student";
      verified = true; // students don’t need admin verification
    }

    // Check if user already exists
    let user = await User.findOne({ uid });
    
    if (!user) {
      user = new User({
        uid,
        email,
        name,
        department,
        graduationYear,
        role,
        verified,
      });
      await user.save();

      //  Set Firebase custom claims for consistent roles
      await admin.auth().setCustomUserClaims(uid, { role, verified });
    }
    
    res.status(201).json({ message: "User registered", user });
  } catch (err) {
    console.error("Error creating user:", err);
    res.status(500).json({ message: "Error creating user", error: err.message });
  }
};

//  Get logged-in user profile
export const getProfile = async (req, res) => {
  try {
    const { uid } = req.params;
      if (!uid)
      return res.status(400).json({ message: "UID is required" });

    if (req.user.uid !== uid)
      return res.status(403).json({ message: "Unauthorized" });

    const user = await User.findOne({ uid });

    if (!user)
      return res.status(404).json({ message: "User not found" });

    res.status(200).json(user);

  } catch (error) {
    console.error("Error fetching profile:", error);
    res.status(500).json({ message: "Error fetching profile", error: error.message });
  }
};