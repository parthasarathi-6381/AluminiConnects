// controllers/achievementController.js
import Achievement from "../models/Achievement.js";

export const getAllAchievements = async (req, res) => {
  try {
    console.log('Fetching achievements...');
    
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 6;
    const skip = (page - 1) * limit;

    const [achievements, totalCount] = await Promise.all([
      Achievement.find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Achievement.countDocuments()
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    console.log(`Found ${achievements.length} achievements`);

    res.json({
      achievements,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error("Error fetching achievements:", error);
    res.status(500).json({ message: "Error fetching achievements", error: error.message });
  }
};

export const createAchievement = async (req, res) => {
  try {
    console.log('Creating achievement:', req.body);
    
    const { imageUrl, description } = req.body;
    
    if (!imageUrl || !description) {
      return res.status(400).json({ message: "Image URL and description are required" });
    }

    const newAchievement = new Achievement({
      imageUrl,
      description,
      postedBy: req.user?.name || "Admin",
    });

    const savedAchievement = await newAchievement.save();
    console.log('Achievement created:', savedAchievement);

    res.status(201).json(savedAchievement);
  } catch (error) {
    console.error("Error creating achievement:", error);
    res.status(500).json({ message: "Error creating achievement", error: error.message });
  }
};

export const deleteAchievement = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('Deleting achievement:', id);
    
    const achievement = await Achievement.findByIdAndDelete(id);
    
    if (!achievement) {
      return res.status(404).json({ message: "Achievement not found" });
    }

    console.log('Achievement deleted:', achievement);
    res.json({ message: "Achievement deleted successfully" });
  } catch (error) {
    console.error("Error deleting achievement:", error);
    res.status(500).json({ message: "Error deleting achievement", error: error.message });
  }
};