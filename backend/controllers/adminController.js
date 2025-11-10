// controllers/adminController.js
import admin from "../firebase/firebaseAdmin.js";
import User from "../models/User.js";

// Get all users
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Error fetching users", error });
  }
};

// Search users by name or email
export const searchUsers = async (req, res) => {
  const { q } = req.query;
  try {
    const users = await User.find({
      $or: [
        { name: { $regex: q, $options: "i" } },
        { email: { $regex: q, $options: "i" } },
      ],
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Error searching users", error });
  }
};

// filter by Role
export const filterByRole = async (req, res) => {
  const { role } = req.params;
  try {
    const users = await User.find({
      role: { $regex: `^${role}$`, $options: "i" },
    }).collation({ locale: "en", strength: 2 });

    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Error filtering users", error });
  }
};



// Promote student → clubMember
export const updateUserRole = async (req, res) => {
  const { uid, newRole } = req.body;

  try {
    const validRoles = ["student", "clubMember", "admin"];
    if (!validRoles.includes(newRole))
      return res.status(400).json({ message: "Invalid role" });

    const user = await User.findOneAndUpdate({ uid }, { role: newRole }, { new: true });
    if (!user) return res.status(404).json({ message: "User not found" });

    // Update Firebase custom claims
    await admin.auth().setCustomUserClaims(uid, { role: newRole, verified: user.verified });
    await admin.auth().revokeRefreshTokens(uid);

    res.json({ message: `Role updated to ${newRole}`, user });
  } catch (error) {
    res.status(500).json({ message: "Error updating role", error });
  }
};

// Verify alumni
export const verifyAlumni = async (req, res) => {
  const { uid } = req.body;

  try {
    const user = await User.findOneAndUpdate(
      { uid, role: "alumni" },
      { verified: true },
      { new: true }
    );

    if (!user) return res.status(404).json({ message: "Alumni not found" });

    await admin.auth().setCustomUserClaims(uid, { role: "alumni", verified: true });
    await admin.auth().revokeRefreshTokens(uid);

    res.json({ message: "Alumni verified successfully", user });
  } catch (error) {
    res.status(500).json({ message: "Error verifying alumni", error });
  }
};
