// routes/jobRoutes.js
import express from "express";
import { getAllJobs, createJobs, deleteJobs } from "../controllers/jobController.js";
import verifyFirebaseToken from "../middleware/verifyFirebaseToken.js";

const router = express.Router();

router.get("/", verifyFirebaseToken, getAllJobs);
router.post("/", verifyFirebaseToken, createJobs);
router.delete("/:id", verifyFirebaseToken, deleteJobs);

export default router;
