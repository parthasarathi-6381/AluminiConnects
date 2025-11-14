import express from "express";
import verifyFirebaseToken from "../middleware/verifyFirebaseToken.js";
import { isClubMemberOrAdmin } from "../middleware/role.middleware.js";
import upload from "../middleware/upload.js";

import {
  createEvent,
  editEvent,
  deleteEvent,
  getAllEvents,
  registerForEvent,
  getUpcomingEvents,
  getEventRegistrations,
  exportEventRegistrationsExcel,
} from "../controllers/eventController.js";

const router = express.Router();

// Protected routes: create/edit/delete require auth + role
router.post(
  "/create",
  verifyFirebaseToken,
  isClubMemberOrAdmin,
  upload.single("image"),
  createEvent
);

router.put(
  "/:eventId/edit",
  verifyFirebaseToken,
  isClubMemberOrAdmin,
  upload.single("image"),
  editEvent
);

// Use DELETE method
router.delete(
  "/:eventId",
  verifyFirebaseToken,
  isClubMemberOrAdmin,
  deleteEvent
);

// Public or protected depending on your design
router.get("/", verifyFirebaseToken ,getAllEvents);

// Upcoming events (maybe public) – if you want protected, add verify
router.get("/upcoming", verifyFirebaseToken, getUpcomingEvents);

// Registration route
router.post(
  "/:eventId/register",
  verifyFirebaseToken,
  registerForEvent
);

// View registrations – admin or creator only
router.get(
  "/:eventId/registrations",
  verifyFirebaseToken,
  getEventRegistrations
);

// Export registrations Excel
router.get(
  "/:eventId/registrations/export",
  verifyFirebaseToken,
  exportEventRegistrationsExcel
);

export default router;
