// cronJobs/cleanupEvents.js

import cron from "node-cron";
import Event from "../models/event.js";

// Schedule: runs every day at midnight (00:00)
cron.schedule("0 0 * * 0", async () => {
  try {
    const currentDate = new Date();

    // Delete events whose endDate has passed
    const result = await Event.deleteMany({ endDate: { $lt: currentDate } });

    console.log(`[CRON] Deleted ${result.deletedCount} completed events at ${currentDate.toISOString()}`);
  } catch (error) {
    console.error("[CRON ERROR] Failed to clean up events:", error);
  }
});
