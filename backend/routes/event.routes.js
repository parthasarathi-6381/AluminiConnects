import express from "express";
import verifyFirebaseToken from "../middleware/verifyFirebaseToken.js";
import { 
  createEvent,
  editEvent,
  deleteEvent, 
  getAllEvents, 
  registerForEvent, 
  getUpcomingEvents,
  exportEventRegistrationsExcel,
  getEventRegistrations
} from "../controllers/eventController.js";
import { isClubMemberOrAdmin } from "../middleware/role.middleware.js";

const router = express.Router();

// Existing routes
router.post("/create", verifyFirebaseToken, isClubMemberOrAdmin, createEvent);
router.put("/:eventId/edit", verifyFirebaseToken, isClubMemberOrAdmin, editEvent);
router.post("/delete", verifyFirebaseToken, isClubMemberOrAdmin, deleteEvent);
router.get("/", verifyFirebaseToken, getAllEvents);
router.post("/:eventId/register", verifyFirebaseToken, registerForEvent);
router.get("/:eventId/registrations",verifyFirebaseToken,getEventRegistrations);
router.get("/upcoming", verifyFirebaseToken, getUpcomingEvents);       //  Student/Alumni route
router.get("/:eventId/registrations/export",verifyFirebaseToken,exportEventRegistrationsExcel);


export default router;
