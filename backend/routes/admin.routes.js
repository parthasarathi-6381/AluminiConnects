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
} from "../controllers/adminController.js";

const router = express.Router();

// all routes protected by admin access
router.use(verifyFirebaseToken, authorizeRoles("admin"));

// GET all users
router.get("/users", getAllUsers);

// Search users by email or name
router.get("/users/search", searchUsers);

// Filter users by role (student / clubMember / alumni)
router.get("/users/filter/:role", filterByRole);

// Promote student → clubMember
router.put("/users/role", updateUserRole);

// Verify alumni
router.put("/users/verify", verifyAlumni);

export default router;
