import Event from "../models/Event.js";
import Notification from "../models/Notification.js";
import User from "../models/User.js";
import cloudinary from "../config/cloudinary.js";

// ================== CREATE EVENT ==================
export const createEvent = async (req, res) => {
  try {
      
    console.log("CLOUD:", process.env.CLOUD_NAME);
console.log("FILE:", req.file);
    if (!req.user.club) {
      return res.status(400).json({
        message: "Club not assigned to user",
      });
    }

    let posterPath = null;

if (req.file) {
  const result = await cloudinary.uploader.upload(req.file.path, {
    folder: "events",
  });

  posterPath = result.secure_url;
}

    const event = await Event.create({
      title: req.body.title,
      description: req.body.description,

      highlights: JSON.parse(req.body.highlights || "[]"),

      date: req.body.date,
      time: req.body.time,
      venue: req.body.venue,

      registrationLink: req.body.registrationLink,

      contacts: req.body.contacts
        ? JSON.parse(req.body.contacts)
        : [],

      club: req.user.club, // ✅ FIXED
      createdBy: req.user._id,

      tags: JSON.parse(req.body.tags || "[]"),

      poster: posterPath,
    });

    res.status(201).json(event);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// ================== GET ALL EVENTS (WITH CLUB FILTER) ==================
export const getAllEvents = async (req, res) => {
  try {
    const { club } = req.query;
    const filter = club ? { club } : {};

    const events = await Event.find(filter)
      .populate("club", "name")
      .populate("createdBy", "_id name email")
      .populate("registeredUsers", "_id"); // ✅ IMPORTANT

    res.json(events);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch events" });
  }
};

// ================== GET MY EVENTS ==================
export const getMyEvents = async (req, res) => {
  try {
    const events = await Event.find({
      createdBy: req.user._id,
    }).sort({ date: -1 });

    res.json(events);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch events" });
  }
};

// ================== COMPLETE EVENT ==================
export const completeEvent = async (req, res) => {
  try {
    const { id } = req.params;

    const event = await Event.findById(id).populate("registeredUsers");
    if (!event) return res.status(404).json({ message: "Event not found" });

    event.status = "completed";
    await event.save();

    // ✅ Notify all registered users
    const notifications = event.registeredUsers.map(
      (user) =>
        new Notification({
          user: user._id,
          message: `Event "${event.title}" has been marked as completed.`,
          type: "completed",
        })
    );

    await Notification.insertMany(notifications);

    res.json({ message: `Event "${event.title}" marked as completed and users notified.` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ================== UPLOAD EVENT PHOTOS ==================
export const uploadEventPhotos = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event)
      return res.status(404).json({ message: "Event not found" });

    if (event.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

  const photoUrls = [];

for (const file of req.files) {
  const result = await cloudinary.uploader.upload(file.path, {
    folder: "events/photos",
  });

  photoUrls.push(result.secure_url);
}

    event.photos.push(...photoUrls);
    await event.save();

    res.json({ message: "Photos uploaded", event });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ================== UPLOAD REPORT ==================
export const uploadEventReport = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event)
      return res.status(404).json({ message: "Event not found" });

    if (event.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

const result = await cloudinary.uploader.upload(req.file.path, {
  folder: "events/reports",
  resource_type: "raw", // for docs/pdf
});

event.reportFile = result.secure_url;
    await event.save();

    res.json({ message: "Report uploaded", event });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


export const registerEvent = async (req, res) => {
  try {
    const eventId = req.params.id;
    const userId = req.user._id;

    const event = await Event.findById(eventId);

    if (!event)
      return res.status(404).json({ message: "Event not found" });

    // ❌ Prevent registering completed event
    if (new Date(event.date) < new Date()) {
      return res.status(400).json({ message: "Event already completed" });
    }

    // ❌ Prevent duplicate registration
    if (event.registeredUsers.includes(userId)) {
      return res.status(400).json({ message: "Already registered" });
    }

    // ✅ Register user
    event.registeredUsers.push(userId);
    await event.save();

    // ✅ Notification
    await Notification.create({
      user: userId,
      message: `You registered for "${event.title}" 🎉`,
      type: "info",
    });

    res.json({ message: "Registered successfully" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};


// ================== DELETE EVENT ==================
export const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: "Event not found" });

    // Only creator can delete
    if (String(event.createdBy) !== String(req.user._id)) {
      return res.status(403).json({ message: "Not authorized to delete this event" });
    }

    // Use findByIdAndDelete instead of remove
    await Event.findByIdAndDelete(req.params.id);

    console.log(`Event ${event._id} deleted successfully`);
    res.json({ message: "Event deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};


// Update event and notify registered users
export const updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const { venue, date, time } = req.body;

    const event = await Event.findById(id).populate("registeredUsers");

    if (!event) return res.status(404).json({ message: "Event not found" });

    if (venue) event.venue = venue;
    if (date) event.date = date;
    if (time) event.time = time;

    await event.save();

    // ✅ notify ALL registered users
const notifications = event.registeredUsers.map(
  (user) =>
    new Notification({
      user: user._id,
      message: `Event "${event.title}" has been updated: New venue: ${venue || event.venue}. New date: ${date || event.date}. New time: ${time || event.time}.`,
      type: "update",
    })
);

    await Notification.insertMany(notifications);

    res.json({ message: "Updated + notified" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
