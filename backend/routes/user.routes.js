
import express from 'express';
import verifyFirebaseToken  from '../middleware/verifyFirebaseToken.js'; 
import { createUser, getProfile } from '../controllers/userController.js';
const router = express.Router();

router.post("/create", verifyFirebaseToken, createUser);
router.get("/profile", verifyFirebaseToken, getProfile);

export default router;
