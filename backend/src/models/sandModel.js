import mongoose from "mongoose";

const sandSchema = new mongoose.Schema({
    userID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    imagePath: {
        type: String,
        required: true
    }
}, { timestamps: true });

export default mongoose.model("Sand", sandSchema);
