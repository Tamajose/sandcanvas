import Sand from "../models/sandModel.js";
import fs from "fs";
import path from "path";
import cloudinary from "../../config/cloudinary.js";

export const saveCanvas = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: "Image file required!",
      });
    }

    const { isPublic, tags, name, description } = req.body;

    if (!name) {
      return res.status(400).json({
        message: "Creation name is required!",
      });
    }
    let parsedTags = [];
    if (tags) {
      if (typeof tags === 'string') {
        try {
          parsedTags = JSON.parse(tags);
        } catch(e) {
          parsedTags = tags.split(',').map(t => t.trim());
        }
      } else if (Array.isArray(tags)) {
        parsedTags = tags;
      }
    }
    
    let isPublicBool = true;
    if (isPublic !== undefined) {
      isPublicBool = isPublic === 'true' || isPublic === true;
    }

    const imagePath = req.file.path; // Cloudinary URL

    const sand = await Sand.create({
      userID: req.user._id,
      name,
      description,
      imagePath,
      isPublic: isPublicBool,
      tags: parsedTags,
    });

    console.log(`Cloudinary Upload Success: Canvas saved to ${imagePath}`);

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
    if (creation.imagePath && creation.imagePath.includes('cloudinary.com')) {
      const parts = creation.imagePath.split('/');
      const filename = parts.pop();
      const publicId = "sandcanvas_creations/" + filename.split('.')[0];
      await cloudinary.uploader.destroy(publicId);
      console.log(`Cloudinary Deletion Success: Removed canvas ${publicId}`);
    } else {
      const filePath = path.join(process.cwd(), creation.imagePath);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await creation.deleteOne();

    res.status(200).json({ message: "Creation removed" });
  } catch (error) {
    console.error("Delete Creation Error: ", error);
    res.status(500).json({ message: "Server Error" });
  }
};

export const getAllCreations = async (req, res) => {
  try {
    const creations = await Sand.find({ isPublic: { $ne: false } })
      .populate("userID", "name")
      .sort({
        createdAt: -1,
      });
    res.status(200).json(creations);
  } catch (error) {
    console.error("Get All Creations Error: ", error);
    res.status(500).json({
      message: "Server Error",
    });
  }
};

export const updateCreation = async (req, res) => {
  try {
    const { isPublic, tags, name, description } = req.body;
    const creation = await Sand.findById(req.params.id);

    if(!creation){
      return res.status(404).json({
        message: "Creation not found"
      });
    }

    if(creation.userID.toString() !== req.user._id.toString()){
      return res.status(401).json({
        message: "Not authorized"
      });
    }

    if(name !== undefined) creation.name = name;
    if(description !== undefined) creation.description = description;

    if(isPublic !== undefined){
      creation.isPublic = isPublic === 'true' || isPublic === true;
    }
    
    if(tags !== undefined){
      let parsedTags = tags;
      if(typeof tags === 'string'){
        try{
          parsedTags = JSON.parse(tags);
        } catch(e){
          parsedTags = tags.split(',').map(t => t.trim());
        }
      }
      creation.tags = parsedTags;
    }

    await creation.save();
    res.status(200).json({ message: "Creation updated", creation });
  } catch (error){
    console.error("Update Creation Error: ", error);
    res.status(500).json({
      message: "Server Error"
    });
  }
};

export const toggleLikeCreation = async (req, res) => {
  try {
    const creation = await Sand.findById(req.params.id);
    if (!creation) {
      return res.status(404).json({ message: "Creation not found" });
    }

    const userId = req.user._id;
    const isLiked = creation.likes.includes(userId);

    if (isLiked) {
      // Unlike
      creation.likes = creation.likes.filter(id => id.toString() !== userId.toString());
    } else {
      // Like
      creation.likes.push(userId);
    }

    await creation.save();
    
    res.status(200).json({ 
      message: isLiked ? "Unliked successfully" : "Liked successfully",
      likes: creation.likes 
    });
  } catch (error) {
    console.error("Toggle Like Error: ", error);
    res.status(500).json({ message: "Server Error" });
  }
};
