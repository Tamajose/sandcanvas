import Comment from "../models/commentModel.js";
import Sand from "../models/sandModel.js";

export const addComment = async (req, res) => {
  try {
    const { text } = req.body;
    const { creationId } = req.params;

    if (!text || !text.trim()) {
      return res.status(400).json({ message: "Comment text is required" });
    }

    const creation = await Sand.findById(creationId);
    if (!creation) {
      return res.status(404).json({ message: "Creation not found" });
    }

    const comment = await Comment.create({
      text,
      userID: req.user._id,
      creationID: creationId,
    });

    const populatedComment = await comment.populate(
      "userID",
      "name profileImage",
    );

    res.status(201).json(populatedComment);
  } catch (error) {
    console.error("Add Comment Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

export const getCommentsByCreation = async (req, res) => {
  try {
    const { creationId } = req.params;
    const comments = await Comment.find({ creationID: creationId })
      .populate("userID", "name profileImage")
      .sort({ createdAt: -1 });

    res.status(200).json(comments);
  } catch (error) {
    console.error("Get Comments Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

export const updateComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { text } = req.body;

    const comment = await Comment.findById(id);

    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    if (comment.userID.toString() !== req.user._id.toString()) {
      return res
        .status(401)
        .json({ message: "Not authorized to update this comment" });
    }

    comment.text = text || comment.text;
    await comment.save();

    res.status(200).json({ message: "Comment updated", comment });
  } catch (error) {
    console.error("Update Comment Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

export const deleteComment = async (req, res) => {
  try {
    const { id } = req.params;

    const comment = await Comment.findById(id);

    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    if (comment.userID.toString() !== req.user._id.toString()) {
      return res
        .status(401)
        .json({ message: "Not authorized to delete this comment" });
    }

    await comment.deleteOne();

    res.status(200).json({ message: "Comment removed" });
  } catch (error) {
    console.error("Delete Comment Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};
