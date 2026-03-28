import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["student", "admin", "clubLead"],
      default: "student", // 🔒 lock signup to student
    },
    club: { type: mongoose.Schema.Types.ObjectId, ref: "Club", default: null },
    interests: {
  type: [String],
  default: [],
},

  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
