// routes/achievementRoutes.js
import express from "express";
import { 
  getAllAchievements, 
  createAchievement, 
  deleteAchievement 
} from "../controllers/achievementController.js";
import verifyFirebaseToken from "../middleware/verifyFirebaseToken.js";

const router = express.Router();

// Public route - anyone can view achievements
router.get("/", getAllAchievements);

// Protected routes - only authenticated users can create/delete
router.post("/", verifyFirebaseToken, createAchievement);
router.delete("/:id", verifyFirebaseToken, deleteAchievement);

export default router;