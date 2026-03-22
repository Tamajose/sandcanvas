import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    passwordHash: {
      type: String,
    },
    name: {
      type: String,
    },
    googleId: {
      type: String,
    },
    profileImage: {
      url: String,
      publicId: String,
    },
    bio: {
      type: String,
      default: "",
    },
  },
  { timestamps: true },
);

export default mongoose.model("User", userSchema);
