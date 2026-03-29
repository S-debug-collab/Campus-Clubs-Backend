import mongoose from "mongoose";

const eventSchema = new mongoose.Schema(
{
  title: {
    type: String,
    required: true,
    trim: true
  },

  description: {
    type: String,
    required: true
  },

  highlights: {
    type: [String],
    default: []
  },

  date: {
    type: Date,
    required: true
  },

  time: {
    type: String
  },

  venue: {
    type: String
  },

  registrationLink: {
    type: String
  },

  contacts: [
    {
      name: String,
      phone: String
    }
  ],

  club: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Club",
    required: true
  },

  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  tags: {
    type: [String],
    default: []
  },

  poster: {
    type: String,
    default: null
  },

  photos: {
    type: [String],
    default: []
  },

  reportFile: {
    type: String,
    default: null
  },

  registeredUsers: [
    { type: mongoose.Schema.Types.ObjectId, ref: "User" }
  ],

  status: {
    type: String,
    enum: ["upcoming", "completed"],
    default: "upcoming"
  }

},
{ timestamps: true }
);

// ✅ ADD INDEX HERE (BEFORE EXPORT)
eventSchema.index(
  { title: 1, date: 1, club: 1 },
  { unique: true }
);

export default mongoose.model("Event", eventSchema);
