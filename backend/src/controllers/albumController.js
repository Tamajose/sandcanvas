import Album from "../models/albumModel.js"
import Sand from "../models/sandModel.js"

export const createAlbum = async (req, res) => {
    try{
        const { name } = req.body;

        if(!name){
            return res.status(400).json({
                message: "Album Name required!"
            });
        }

        const album = await Album.create({
            userID: req.user._id,
            name,
            image: [],
        });

        res.status(201).json({
            message: "Album Created",
            album,
        });
    } catch(error){
        console.error("Create album Error: ", error);
        res.status(500).json({
            message: "Server Error"
        });
    }
};