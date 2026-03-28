import Club from "../models/Club.js";
import User from "../models/User.js";
import Notification from "../models/Notification.js";
import cloudinary from "../config/cloudinary.js"; // ✅ ADD THIS

// ================= CREATE CLUB =================
export const createClub = async (req, res) => {
  try {
    const { name, description, leadEmail } = req.body;

    if (!description || description.length < 500) {
      return res
        .status(400)
        .json({ message: "Description must be around 100 words" });
    }

    const lead = await User.findOne({ email: leadEmail });
    if (!lead) return res.status(404).json({ message: "Lead not found" });

    lead.role = "clubLead";

    // ✅ CLOUDINARY UPLOAD
    let logo = null;
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "clubs",
      });
      logo = result.secure_url;
    }

    const club = await Club.create({
      name,
      description,
      lead: lead._id,
      logo, // ✅ store cloudinary URL
    });

    lead.club = club._id;
    await lead.save();

    await Notification.create({
      user: lead._id,
      message: `You are now the club lead of "${club.name}" 🎯`,
      type: "club",
    });

    res.status(201).json(club);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ================= GET ALL CLUBS =================
export const getAllClubs = async (req, res) => {
  try {
    const clubs = await Club.find().populate("lead", "name email role logo");
    res.json(clubs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ================= UPDATE CLUB =================
export const updateClub = async (req, res) => {
  try {
    const { name, description, leadEmail } = req.body;

    const club = await Club.findById(req.params.id);
    if (!club) {
      return res.status(404).json({ message: "Club not found" });
    }

    if (name) club.name = name;
    if (description) club.description = description;

    if (leadEmail) {
      const user = await User.findOne({ email: leadEmail });

      if (!user) {
        return res.status(400).json({ message: "User not found" });
      }

      club.lead = user._id;

      user.role = "clubLead";
      user.club = club._id;
      await user.save();

      await Notification.create({
        user: user._id,
        message: `🎉 Congrats ${user.name}, you're now the Club Lead of ${club.name}!`,
      });
    }

    // ✅ CLOUDINARY UPDATE
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "clubs",
      });

      club.logo = result.secure_url;
    }

    await club.save();

    res.json({ message: "Club updated successfully", club });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

// ================= DELETE CLUB =================
export const deleteClub = async (req, res) => {
  try {
    const club = await Club.findById(req.params.id);
    if (!club) return res.status(404).json({ message: "Club not found" });

    if (club.lead) {
      await User.findByIdAndUpdate(club.lead, { role: "student", club: null });
    }

    await Club.findByIdAndDelete(req.params.id);
    res.json({ message: "Club deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
