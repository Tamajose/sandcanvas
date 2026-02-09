import Sand from "../models/sandModel.js";

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
