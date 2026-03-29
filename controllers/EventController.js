import Event from "../models/Event.js";
import Notification from "../models/Notification.js";
import User from "../models/User.js";
import cloudinary from "../config/cloudinary.js";
import streamifier from "streamifier";

// 🔥 HELPER: Upload from buffer (Railway fix)
const uploadFromBuffer = (buffer, folder = "events") => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder },
      (error, result) => {
        if (result) resolve(result);
        else reject(error);
      }
    );
    streamifier.createReadStream(buffer).pipe(stream);
  });
};

// ================== CREATE EVENT ==================
export const createEvent = async (req, res) => {
  try {
    if (!req.user.club) {
      return res.status(400).json({
        message: "Club not assigned to user",
      });
    }

    // 🔥 1️⃣ CHECK DUPLICATE FIRST (VERY IMPORTANT)
    const existing = await Event.findOne({
      title: req.body.title,
      date: req.body.date,
      club: req.user.club,
    });

    if (existing) {
      return res.status(400).json({
        message: "Event already exists 🚫",
      });
    }

    // 🔥 2️⃣ UPLOAD POSTER (if exists)
    let posterPath = null;

    if (req.file) {
      const result = await uploadFromBuffer(req.file.buffer, "events");
      posterPath = result.secure_url;
    }

    // 🔥 3️⃣ CREATE EVENT
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
      club: req.user.club,
      createdBy: req.user._id,
      tags: JSON.parse(req.body.tags || "[]"),
      poster: posterPath,
    });

    res.status(201).json(event);

  } catch (error) {
    console.error("CREATE EVENT ERROR:", error);

    // 🔥 4️⃣ HANDLE DUPLICATE DB ERROR (extra safety)
    if (error.code === 11000) {
      return res.status(400).json({
        message: "Event already exists 🚫",
      });
    }

    res.status(500).json({ message: error.message });
  }
};
export const getAllEvents = async (req, res) => {
  try {
    const { club } = req.query;
    const filter = club ? { club } : {};

    const events = await Event.find(filter)
      .populate("club", "name")
      .populate("createdBy", "_id name email")
      .populate("registeredUsers", "_id")
      .lean(); // 🔥 IMPORTANT

    // 🔥 REMOVE DUPLICATES
    const uniqueEvents = Array.from(
      new Map(events.map((e) => [e._id.toString(), e])).values()
    );

    res.json(uniqueEvents);
  } catch (err) {
    console.error(err);
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

    const notifications = event.registeredUsers.map(
      (user) =>
        new Notification({
          user: user._id,
          message: `Event "${event.title}" has been marked as completed.`,
          type: "completed",
        })
    );

    await Notification.insertMany(notifications);

    res.json({ message: "Event marked as completed & users notified" });
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
      const result = await uploadFromBuffer(file.buffer, "events/photos");
      photoUrls.push(result.secure_url);
    }

    event.photos.push(...photoUrls);
    await event.save();

    res.json({ message: "Photos uploaded", event });
  } catch (err) {
    console.error(err);
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

    const result = await cloudinary.uploader.upload_stream(
      { folder: "events/reports", resource_type: "raw" },
      (error, result) => {
        if (error) throw error;
        event.reportFile = result.secure_url;
      }
    );

    streamifier.createReadStream(req.file.buffer).pipe(result);

    await event.save();

    res.json({ message: "Report uploaded", event });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

// ================== REGISTER EVENT ==================
export const registerEvent = async (req, res) => {
  try {
    const eventId = req.params.id;
    const userId = req.user._id;

    const event = await Event.findById(eventId);

    if (!event)
      return res.status(404).json({ message: "Event not found" });

    if (new Date(event.date) < new Date()) {
      return res.status(400).json({ message: "Event already completed" });
    }

    if (event.registeredUsers.includes(userId)) {
      return res.status(400).json({ message: "Already registered" });
    }

    event.registeredUsers.push(userId);
    await event.save();

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

    if (String(event.createdBy) !== String(req.user._id)) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await Event.findByIdAndDelete(req.params.id);

    res.json({ message: "Event deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

// ================== UPDATE EVENT ==================
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

    const notifications = event.registeredUsers.map(
      (user) =>
        new Notification({
          user: user._id,
          message: `Event "${event.title}" updated`,
          type: "update",
        })
    );

    await Notification.insertMany(notifications);

    res.json({ message: "Updated + notified" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
