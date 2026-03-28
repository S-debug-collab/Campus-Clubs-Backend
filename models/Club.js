import mongoose from "mongoose";

const clubSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Club name is required"],
      unique: true,
    },
    description: {
      type: String,
      required: [true, "Club description is required"],
      minlength: [500, "Description should be around 100 words"], // ~100 words ~500 characters
      maxlength: [1000, "Description should not exceed 200 words"], // optional
    },
    logo: {
      type: String, // path to uploaded logo image
      required: false,
    },
    lead: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Club lead is required"],
    },
  },
  { timestamps: true }
);

export default mongoose.model("Club", clubSchema);