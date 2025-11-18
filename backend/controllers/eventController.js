import Event from "../models/event.js";
import Registration from "../models/registration.js";
import ExcelJS from "exceljs";
import User from "../models/User.js";
import upload from "../middleware/upload.js";


// In route registration (see below) use upload.single("image")

// Updated createEvent
        /* ******** PRIVATE ROUTES ********** */
//  Create Event
// @private route

export const createEvent = async (req, res) => {
  try {
    const { title, description, date, venue, capacity } = req.body;
    const { uid, role } = req.user;

    if (role !== "admin" && role !== "clubMember") {
      return res.status(403).json({ message: "Only admins & club members can create events" });
    }

    const event = await Event.create({
      title,
      description,
      date,
      venue,
      capacity,
      createdBy: {
        uid,
        role
      }
    });

    res.status(201).json({ message: "Event created successfully", event });
  } catch (error) {
    console.error("Error creating event:", error.message);
    res.status(500).json({ message: "Error creating event", error });
  }
};


//  Edit Event (only creator/admin)
// @private route
export const editEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { uid, role } = req.user;

    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ message: "Event not found" });

    if (role !== "admin" && event.createdBy.uid !== uid)
      return res.status(403).json({ message: "Not authorized to edit this event" });

    const updatedEvent = await Event.findByIdAndUpdate(eventId, req.body, { new: true });
    res.json({ message: "Event updated successfully", updatedEvent });
  } catch (error) {
    res.status(500).json({ message: "Error editing event", error });
  }
};

//  Delete Event
// @private route
export const deleteEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { uid, role } = req.user;

    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ message: "Event not found" });

    if (role !== "admin" && event.createdBy.uid !== uid) {
      return res.status(403).json({ message: "Not authorized to delete this event" });
    }

    await event.deleteOne();
    res.json({ message: "Event deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting event", error });
  }
};


//  View Registrations (creator/admin)
// @private route
export const viewRegistrations = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { uid, role } = req.user;

    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ message: "Event not found" });

    if (role !== "admin" && event.createdBy.uid !== uid) {
      return res.status(403).json({ message: "Not authorized to view registrations" });
    }

    const registrations = await Registration.find({ eventId }).sort({ registeredAt: -1 });

    res.json({
      eventTitle: event.title,
      date: event.date,
      totalRegistrations: registrations.length,
      registrations
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching registrations", error });
  }
};


//  Auto-cleanup past events (run daily via cron or manually)
export const autoCleanupEvents = async (req, res) => {
  try {
    const now = new Date();

    const updated = await Event.updateMany(
      { date: { $lt: now }, status: "upcoming" },
      { $set: { status: "completed" } }
    );

    res.json({ message: "Past events marked as completed", updatedCount: updated.modifiedCount });
  } catch (error) {
    res.status(500).json({ message: "Error cleaning up events", error });
  }
};

// see the details of the registration page by page
//@privat route 
export const getEventRegistrations = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { uid, role } = req.user;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ message: "Event not found" });

    if (role !== "admin" && event.createdBy.uid !== uid)
      return res.status(403).json({ message: "Access denied" });

    const total = await Registration.countDocuments({ eventId });
    const registrations = await Registration.find({ eventId })
      .sort({ registeredAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      event: {
        _id: event._id,
        title: event.title,
        date: event.date,
        venue: event.venue,
      },
      pagination: {
        totalRegistrations: total,
        currentPage: page,
        totalPages: Math.ceil(total / limit),
      },
      registeredUsers: registrations,
    });
  } catch (error) {
    console.error("Error fetching event registrations:", error);
    res.status(500).json({ message: "Error fetching event registrations", error });
  }
};

// to download the details of those who registered for the event
// @private route
export const exportEventRegistrationsExcel = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { uid, role } = req.user;

    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ message: "Event not found" });

    // Only admin or event organizer can download registrations
    if (role !== "admin" && event.createdBy.uid !== uid) {
      return res.status(403).json({ message: "Access denied" });
    }

    // Get all registrations for this event
    const registrations = await Registration.find({ eventId }).sort({ registeredAt: -1 });

    // Create Excel workbook & worksheet
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Registrations");

    // Add header row
    sheet.columns = [
      { header: "Name", key: "name", width: 25 },
      { header: "Email", key: "email", width: 30 },
      { header: "Role", key: "role", width: 15 },
      { header: "Registered At", key: "registeredAt", width: 25 },
    ];

    // Style header row
    sheet.getRow(1).font = { bold: true };
    sheet.getRow(1).alignment = { horizontal: "center" };

    // Add registration data
    registrations.forEach((reg) => {
      sheet.addRow({
        name: reg.name,
        email: reg.email,
        role: reg.role,
        registeredAt: new Date(reg.registeredAt).toLocaleString(),
      });
    });

    // Set response headers for download
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${event.title.replace(/\s+/g, "_")}_registrations.xlsx"`
    );

    // Write file to response
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error("Error exporting registrations:", error);
    res.status(500).json({ message: "Error exporting registrations", error: error.message });
  }
};

 /* ******** PUBLIC ROUTES ********** */

//  Register for event
// @public route 
export const registerForEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { uid, email, role } = req.user;

    // ❌ Admin cannot register 
    if (role === "admin") {
      return res.status(403).json({ message: "Only students or alumni can register" });
    }

    // ⭐ Fetch from both models
    let user = await User.findOne({ uid });
    if (!user) {
      const AlumniModel = (await import("../models/alumni.js")).default;
      user = await AlumniModel.findOne({ uid });
    }

    if (!user) {
      return res.status(404).json({ message: "User not found in system" });
    }

    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ message: "Event not found" });

    if (event.status !== "upcoming") {
      return res.status(400).json({ message: "Registrations closed for this event" });
    }

    // Already registered?
    const alreadyRegistered = await Registration.findOne({ eventId, userId: uid });
    if (alreadyRegistered) {
      return res.status(400).json({ message: "You have already registered for this event" });
    }

    // Create registration entry
    const registration = new Registration({
      eventId,
      userId: uid,
      name: user.name,
      email,
      role,
    });

    await registration.save();

    res.status(201).json({
      message: "Registered successfully",
      registration,
    });

  } catch (error) {
    console.error("Register event error:", error);
    res.status(500).json({ message: "Error registering for event", error });
  }
};


// to fetch all the events which have been posted(ethier upcoming or completed or ongoing) 
// @public route
export const getAllEvents = async (req, res) => {
  try {
    const { status } = req.query;
    const currentDate = new Date();

    let filter = {};
    if (status === "upcoming") filter = { date: { $gt: currentDate } };
    if (status === "completed") filter = { date: { $lt: currentDate } };

    const events = await Event.find(filter)
      .sort({ date: -1 })
      .select("title description date venue status capacity");

    if (!events.length) {
      return res.status(404).json({ message: "No events found" });
    }

    const formattedEvents = await Promise.all(
  events.map(async (event) => {
    const count = await Registration.countDocuments({ eventId: event._id });
    return {
      _id: event._id,
      title: event.title,
      description: event.description,
      venue: event.venue,
      status: event.status,
      date: event.date,
      capacity: event.capacity,
      registeredCount: count
    };
  })
);



    res.json({
      totalEvents: formattedEvents.length,
      events: formattedEvents,
    });
  } catch (error) {
    console.error("Error fetching events:", error);
    res.status(500).json({ message: "Error fetching events", error: error.message });
  }
};


// get the info of the upcoming events
// @public route
export const getUpcomingEvents = async (req, res) => {
  try {
    const { uid } = req.user;

    const events = await Event.find({
      date: { $gte: new Date() }, // future events
      "registrations.uid": { $ne: uid }, // exclude ones user already registered for
    })
      .sort({ date: 1 })
      .select("title date venue createdBy");

    res.json({ total: events.length, events });
  } catch (error) {
    res.status(500).json({ message: "Error fetching upcoming events", error });
  }
};

export const getMyEvents = async (req, res) => {
  try {
    const { uid } = req.user;

    const events = await Event.find({ "createdBy.uid": uid })
      .select("title date venue createdBy");  // <-- IMPORTANT

    res.json(events);
  } catch (error) {
    console.error("Error loading my events:", error);
    res.status(500).json({ message: "Error loading my events" });
  }
};

