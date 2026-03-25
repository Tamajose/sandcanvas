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

    const { isPublic, tags } = req.body;
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

    const imagePath = `/uploads/${req.file.filename}`;

    const sand = await Sand.create({
      userID: req.user._id,
      imagePath,
      isPublic: isPublicBool,
      tags: parsedTags,
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
    const { isPublic, tags } = req.body;
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
