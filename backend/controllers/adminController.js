// controllers/adminController.js
import admin from "../firebase/firebaseAdmin.js";
import User from "../models/User.js";
import Alumni from "../models/alumni.js";
import Event from "../models/event.js";

// -------------------------------
// GET ALL USERS
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

// -------------------------------
// SEARCH USERS
// -------------------------------
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

// -------------------------------
// FILTER USERS BY ROLE
// -------------------------------
export const filterByRole = async (req, res) => {
  const { role } = req.params;

  console.log("🔥 FILTER ROLE RECEIVED:", role);

  try {
    if (role.toLowerCase() === "student") {
      const students = await User.find({ role: "student" });
      return res.json(students);
    }

    // CLUB MEMBER FILTER FIX 🔥
    if (role.toLowerCase() === "clubmember" || role === "clubMember") {
      const clubMembers = await User.find({ role: "clubMember" });
      return res.json(clubMembers);
    }


    if (role.toLowerCase() === "alumni") {
      const alumni = await Alumni.find({ role: "alumni" });
      return res.json(alumni);
    }

    return res.status(400).json({ message: "Invalid role" });
  } catch (error) {
    res.status(500).json({ message: "Error filtering users", error });
  }
};

// -------------------------------
// UPDATE USER ROLE
// -------------------------------
export const updateUserRole = async (req, res) => {
  const { uid, newRole } = req.body;

  try {
    const validRoles = ["student", "clubMember", "admin", "alumni"];
    if (!validRoles.includes(newRole)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    let user = await User.findOneAndUpdate({ uid }, { role: newRole }, { new: true });

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

// -------------------------------
// VERIFY ALUMNI
// -------------------------------
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

// -------------------------------
// ADMIN PROFILE
// -------------------------------
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

// -------------------------------
// DASHBOARD COUNTS
// -------------------------------
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

// -------------------------------
// DELETE ALUMNI
// -------------------------------
export const deleteAlumni = async (req, res) => {
  const { uid } = req.params;

  try {
    const alumni = await Alumni.findOne({ uid, role: "alumni" });
    if (!alumni) {
      return res.status(404).json({ message: "Alumni not found" });
    }

    await Alumni.deleteOne({ uid });
    await admin.auth().deleteUser(uid);

    res.json({ message: "Alumni deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting alumni", error });
  }
};
