import Job from "../models/Jobs.js";

// GET method to get all jobs
export const getAllJobs = async (req, res) => {
  try {
    const jobs = await Job.find().sort({ createdAt: -1 });
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch jobs", error: err.message });
  }
};

// POST method to create new jobs
export const createJobs = async (req, res) => {
  try {
    const job = new Job(req.body);
    await job.save();
    res.status(201).json(job);
  } catch (err) {
    res.status(400).json({ message: "Failed to create job", error: err.message });
  }
}

// Delete method to delete jobs 

export const deleteJobs = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Job.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ message: "Job not found" });
    }
    res.json({ message: "Job deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete job", error: err.message });
  }
}

export const getDashboardCounts = async (req, res) => {
  try {
    const students = await User.countDocuments({ role: "student" });
    const alumni = await User.countDocuments({ role: "alumni" });
    const events = await Event.countDocuments();
    const jobs = await Job.countDocuments(); // <-- add

    res.json({ students, alumni, events, jobs }); // <-- include jobs
  } catch (error) {
    res.status(500).json({ message: "Error fetching counts", error });
  }
};
