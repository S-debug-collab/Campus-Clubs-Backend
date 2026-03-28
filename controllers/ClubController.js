import Club from "../models/Club.js";
import User from "../models/User.js";
import Notification from "../models/Notification.js";

// ================= CREATE CLUB =================
export const createClub = async (req, res) => {
  try {
    const { name, description, leadEmail } = req.body;

    // ✅ Validate description length (~100 words ~500 chars)
    if (!description || description.length < 500) {
      return res
        .status(400)
        .json({ message: "Description must be around 100 words" });
    }

    // ✅ Find the lead
    const lead = await User.findOne({ email: leadEmail });
    if (!lead) return res.status(404).json({ message: "Lead not found" });

    // ✅ Assign role and club to user
    lead.role = "clubLead";

    // ✅ Create club with optional logo
    const club = await Club.create({
      name,
      description,
      lead: lead._id,
      logo: req.file ? `/uploads/${req.file.filename}` : null,
    });

    lead.club = club._id;
    await lead.save();

    // ✅ Notify lead
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

    // ✅ FIRST create club
    const club = await Club.findById(req.params.id);

    if (!club) {
      return res.status(404).json({ message: "Club not found" });
    }

    // ✅ THEN update fields
    if (name) club.name = name;
    if (description) club.description = description;

    // ✅ THEN handle lead
    if (leadEmail) {
      const user = await User.findOne({ email: leadEmail });

      if (!user) {
        return res.status(400).json({ message: "User not found" });
      }

      club.lead = user._id;

      // 🔥 IMPORTANT
      user.role = "clubLead";
      user.club = club._id;  
      await user.save();

       await Notification.create({
    user: user._id,
    message: `🎉 Congrats ${user.name}, you're now the Club Lead of ${club.name}!`,
  });
      
    }

    // ✅ logo update
    if (req.file) {
      club.logo = `/uploads/${req.file.filename}`;
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

    // Reset lead role
    if (club.lead) {
      await User.findByIdAndUpdate(club.lead, { role: "student", club: null });
    }

    await Club.findByIdAndDelete(req.params.id);
    res.json({ message: "Club deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

