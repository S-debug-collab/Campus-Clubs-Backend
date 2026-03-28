import User from "../models/User.js";
import Club from "../models/Club.js";
import Event from "../models/Event.js";

// ✅ Assign Club Lead (matches route: /make-clublead/:userId)
export const assignClubLead = async (req, res) => {
  try {
    const { userId } = req.params; // ✅ from URL
    const { clubId } = req.body;   // ✅ from body

    if (!clubId) {
      return res.status(400).json({ message: "Club ID is required" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // ✅ Optional: check if club exists
    const club = await Club.findById(clubId);
    if (!club) {
      return res.status(404).json({ message: "Club not found" });
    }

    // ✅ Fix role naming
    user.role = "clubLead";
    user.club = clubId;

    await user.save();

    res.json({
      message: "User promoted to Club Lead successfully 🎉",
      user
    });

  } catch (err) {
    console.error("Assign Club Lead Error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};


export const makeAdmin = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    // 🔍 Find new admin user
    const newAdmin = await User.findOne({ email });

    if (!newAdmin) {
      return res.status(404).json({ message: "User not found" });
    }

    // ❌ Remove admin role from ALL existing admins
    await User.updateMany(
      { role: "admin" },
      { $set: { role: "student" } }
    );

    // ✅ Assign new admin
    newAdmin.role = "admin";
    await newAdmin.save();

    res.json({
      message: "Admin transferred successfully 🔄👑",
      user: newAdmin,
    });

  } catch (err) {
    console.error("Make Admin Error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Dashboard Stats
export const getDashboardStats = async (req, res) => {
  try {
    const users = await User.countDocuments({ role: "student" });
    const clubs = await Club.countDocuments();
    const events = await Event.countDocuments();

    res.json({
      users,
      clubs,
      events
    });

  } catch (err) {
    console.error("Stats Error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};