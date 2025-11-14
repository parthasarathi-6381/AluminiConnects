
import express from 'express';
import verifyFirebaseToken  from '../middleware/verifyFirebaseToken.js'; 
import { createUser, getProfile , checkExistingUser } from '../controllers/userController.js';
const router = express.Router();

router.post("/create", verifyFirebaseToken,createUser);
router.get("/:uid", verifyFirebaseToken, getProfile);
router.get("/exists/:uid", checkExistingUser);


export default router;
