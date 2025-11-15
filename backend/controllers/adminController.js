// controllers/adminController.js
import admin from "../firebase/firebaseAdmin.js";
import User from "../models/User.js";
import Alumni from "../models/alumni.js";
import Event from "../models/event.js";



// -------------------------------
// Get all users
// -------------------------------
export const getAllUsers = async (req, res) => {
  try {
    const students = await User.find().sort({ createdAt: -1 });
    const alumni = await Alumni.find().sort({ createdAt: -1 });

    res.json([...students, ...alumni]);
  } catch (error) {
    res.status(500).json({ message: "Error fetching users", error });
  }
};

// Search users
export const searchUsers = async (req, res) => {
  const { q } = req.query;
  try {
    const students = await User.find({
      $or: [
        { name: { $regex: q, $options: "i" } },
        { email: { $regex: q, $options: "i" } }
      ]
    });

    const alumni = await Alumni.find({
      $or: [
        { name: { $regex: q, $options: "i" } },
        { email: { $regex: q, $options: "i" } }
      ]
    });

    res.json([...students, ...alumni]);
  } catch (error) {
    res.status(500).json({ message: "Error searching users", error });
  }
};


// Filter users
export const filterByRole = async (req, res) => {
  const { role } = req.params;

  try {
    if (role.toLowerCase() === "student") {
      const students = await User.find({ role: "student" });
      return res.json(students);
    }

    if (role.toLowerCase() === "alumni") {
      const alumni = await Alumni.find({ role: "alumni" });
      return res.json(alumni);
    }

    res.status(400).json({ message: "Invalid role" });

  } catch (error) {
    res.status(500).json({ message: "Error filtering users", error });
  }
};


// Update role
export const updateUserRole = async (req, res) => {
  const { uid, newRole } = req.body;

  try {
    const valid = ["student", "clubMember", "admin", "alumni"];
    if (!valid.includes(newRole))
      return res.status(400).json({ message: "Invalid role" });

    // Try updating student
    let user = await User.findOneAndUpdate(
      { uid },
      { role: newRole },
      { new: true }
    );

    // If not student, try alumni
    if (!user) {
      user = await Alumni.findOneAndUpdate(
        { uid },
        { role: newRole },
        { new: true }
      );
    }

    if (!user) return res.status(404).json({ message: "User not found" });

    await admin.auth().setCustomUserClaims(uid, {
      role: newRole,
      verified: user.verified,
    });

    await admin.auth().revokeRefreshTokens(uid);

    res.json({ message: `Role updated to ${newRole}`, user });

  } catch (error) {
    res.status(500).json({ message: "Error updating role", error });
  }
};


// Verify Alumni
export const verifyAlumni = async (req, res) => {
  const { uid } = req.body;
  try {
    const user = await Alumni.findOneAndUpdate(
      { uid, role: "alumni" },
      { verified: true },
      { new: true }
    );

    if (!user) return res.status(404).json({ message: "Alumni not found" });

    await admin.auth().setCustomUserClaims(uid, {
      role: "alumni",
      verified: true,
    });

    await admin.auth().revokeRefreshTokens(uid);

    res.json({ message: "Alumni verified successfully", user });
  } catch (error) {
    res.status(500).json({ message: "Error verifying alumni", error });
  }
};

// Admin profile
export const getAdminProfile = async (req, res) => {
  try {
    const { uid } = req.user;

    const user = await User.findOne({ uid }).select("-__v -createdAt");
    if (!user)
      return res.status(404).json({ message: "Admin profile not found" });

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Error fetching profile", error });
  }
};

// Dashboard counts
export const getDashboardCounts = async (req, res) => {
  try {
    const students = await User.countDocuments({ role: "student" });
    const alumni = await Alumni.countDocuments({ role: "alumni" });
    const events = await Event.countDocuments();
   
    res.json({ students, alumni, events });
  } catch (error) {
    res.status(500).json({ message: "Error fetching counts", error });
  }
};

export const deleteAlumni = async (req, res) => {
  const { uid } = req.params;

  try {
    // Check if alumni exists
    const alumni = await Alumni.findOne({ uid, role: "alumni" });

    if (!alumni) {
      return res.status(404).json({ message: "Alumni not found" });
    }

    // Delete from MongoDB
    await Alumni.deleteOne({ uid });

    // Delete account from Firebase Auth
    await admin.auth().deleteUser(uid);

    res.json({ message: "Alumni deleted successfully" });
  } catch (error) {
    console.error("Delete Alumni Error:", error);
    res.status(500).json({ message: "Error deleting alumni", error });
  }
};