import express from 'express';
import { verifyUser } from '../controllers/authController.js';  
const router = express.Router();

router.post("/verify", verifyUser);

export default router;
