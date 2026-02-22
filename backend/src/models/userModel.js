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
    googleId: {
      type: String,
    },
    profileImage: {
      url: String,
      publicId: String,
    },
  },
  { timestamps: true },
);

export default mongoose.model("User", userSchema);
