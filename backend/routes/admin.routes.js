// routes/admin.routes.js
import express from "express";
import verifyFirebaseToken from "../middleware/verifyFirebaseToken.js";
import { authorizeRoles } from "../middleware/authorizeRole.js";

import {
  getAllUsers,
  searchUsers,
  filterByRole,
  updateUserRole,
  verifyAlumni,
  getAdminProfile,
  getDashboardCounts,
  deleteAlumni
} from "../controllers/adminController.js";

// ✅ Declare router FIRST
const router = express.Router();

// ✅ Protect all admin routes
router.use(verifyFirebaseToken, authorizeRoles("admin"));

// -------------------------------
// Admin Dashboard API Routes
// -------------------------------

// Admin profile
router.get("/profile", getAdminProfile);

// Dashboard counts
router.get("/counts", getDashboardCounts);

// Get all users
router.get("/users", getAllUsers);

// Search users
router.get("/users/search", searchUsers);

// Filter users
router.get("/users/filter/:role", filterByRole);

// Update role
router.put("/users/role", updateUserRole);

// Verify alumni
router.put("/users/verify", verifyAlumni);

router.delete("/users/:uid", deleteAlumni);

export default router;
