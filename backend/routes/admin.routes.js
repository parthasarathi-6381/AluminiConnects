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

const router = express.Router();

// protect all admin routes
router.use(verifyFirebaseToken, authorizeRoles("admin"));

// ADMIN PROFILE
router.get("/profile", getAdminProfile);

// DASHBOARD COUNTS
router.get("/counts", getDashboardCounts);

// 🔥 FIX — SEARCH ROUTE MUST COME FIRST
router.get("/users/search", searchUsers);

// 🔥 FIX — THEN FILTER ROUTE
router.get("/users/filter/:role", filterByRole);

// GET ALL USERS
router.get("/users", getAllUsers);

// UPDATE USER ROLE
router.put("/users/role", updateUserRole);

// VERIFY ALUMNI
router.put("/users/verify", verifyAlumni);

// DELETE ALUMNI
router.delete("/users/:uid", deleteAlumni);

export default router;
