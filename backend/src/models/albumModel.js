import mongoose from "mongoose";

const albumSchema = new mongoose.Schema({
        userID: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        name: {
            type: String,
            required: true,
        },
        images: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Sand",
            },
        ],
    },
    { timestamps: true }
);

export default mongoose.model("Album", albumSchema);