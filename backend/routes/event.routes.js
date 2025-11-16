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
  getMyEvents
} from "../controllers/eventController.js";

const router = express.Router();

// CREATE event
router.post(
  "/create",
  verifyFirebaseToken,
  isClubMemberOrAdmin,
  upload.single("image"),
  createEvent
);

// EDIT event
router.put(
  "/:eventId/edit",
  verifyFirebaseToken,
  isClubMemberOrAdmin,
  upload.single("image"),
  editEvent
);

// DELETE event
router.delete(
  "/:eventId",
  verifyFirebaseToken,
  isClubMemberOrAdmin,
  deleteEvent
);

// 🔥 PUBLIC — get all events
router.get("/", getAllEvents);

// UPCOMING events (protected)
router.get("/upcoming", verifyFirebaseToken, getUpcomingEvents);

// REGISTER for event
router.post(
  "/:eventId/register",
  verifyFirebaseToken,
  registerForEvent
);

// CLUBMEMBER / ADMIN — see only own events
router.get(
  "/my-events",
  verifyFirebaseToken,
  isClubMemberOrAdmin,
  getMyEvents
);

// VIEW registrations (creator OR admin)
router.get(
  "/:eventId/registrations",
  verifyFirebaseToken,
  getEventRegistrations
);

// EXPORT registrations
router.get(
  "/:eventId/registrations/export",
  verifyFirebaseToken,
  exportEventRegistrationsExcel
);

export default router;
