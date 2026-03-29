import mongoose from "mongoose";

const suggestionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    topic: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      trim: true
    },

    // 🔥 VOTES
    votes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      }
    ]
  },
  { timestamps: true }
);

// 🔥🔥 PREVENT DUPLICATES (MOST IMPORTANT)
suggestionSchema.index(
  { user: 1, topic: 1, description: 1 },
  { unique: true }
);

export default mongoose.model("Suggestion", suggestionSchema);
