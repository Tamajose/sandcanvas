import User from "../models/userModel.js";
import cloudinary from "../../config/cloudinary.js";
import fs from "fs";

export const updateProfilePicture = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: "No file uploaded!"
      });
    }

    const profileImageData = {
      url: req.file.path,
      publicId: req.file.filename,
    };

    console.log(`Cloudinary Upload Success: Profile Picture saved to ${req.file.path}`);

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { profileImage: profileImageData },
      { new: true },
    ).select("-passwordHash");

    res.status(200).json({
      message: "Profile picture updated",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Update Profile Picture Error:", error);
    res.status(500).json({
      message: "Server Error"
    });
  }
};

export const removeProfilePicture = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user || !user.profileImage?.publicId) {
      return res.status(400).json({
        message: "No profile picture to remove"
      });
    }
    await cloudinary.uploader.destroy(user.profileImage.publicId);
    console.log(`Cloudinary Deletion Success: Removed profile picture ${user.profileImage.publicId}`);

    user.profileImage = { url: "", publicId: "" };
    await user.save();
    res.status(200).json({
      message: "Profile picture removed successfully",
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        profileImage: user.profileImage,
      },
    });
  } catch (error) {
    console.error("Remove Profile Picture Error:", error);
    res.status(500).json({ 
      message: "Server Error" 
    });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { name, bio } = req.body;
    
    const updateData = {};
    if (name) updateData.name = name;
    if (bio !== undefined) updateData.bio = bio;

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ message: "No data provided for update" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true }
    ).select("-passwordHash");

    res.status(200).json({
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Update User Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};
