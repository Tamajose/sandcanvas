import Sand from "../models/sandModel.js";
import fs from "fs";
import path from "path";

export const saveCanvas = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: "Image file required!",
      });
    }

    const imagePath = `/uploads/${req.file.filename}`;

    const sand = await Sand.create({
      userID: req.user._id,
      imagePath,
    });

    res.status(201).json({
      message: "Canvas Saved",
      sand,
    });
  } catch (error) {
    console.error("SandCanvas Error: ", error);
    res.status(500).json({
      message: "Server Error",
    });
  }
};

export const getUserCreations = async (req, res) => {
  try {
    const creations = await Sand.find({ userID: req.user._id }).sort({
      createdAt: -1,
    });
    res.status(200).json(creations);
  } catch (error) {
    console.error("Get Creations Error: ", error);
    res.status(500).json({
      message: "Server Error",
    });
  }
};

export const deleteCreation = async (req, res) => {
  try {
    const creation = await Sand.findById(req.params.id);

    if (!creation) {
      return res.status(404).json({ message: "Creation not found" });
    }

    // Check ownership
    if (creation.userID.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: "Not authorized" });
    }

    // Delete file
    const filePath = path.join(process.cwd(), creation.imagePath);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await creation.deleteOne();

    res.status(200).json({ message: "Creation removed" });
  } catch (error) {
    console.error("Delete Creation Error: ", error);
    res.status(500).json({ message: "Server Error" });
  }
};
