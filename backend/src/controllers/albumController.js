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

export const getUserAlbums = async (req, res) => {
    try{
        const albums = await Album.find({ userID: req.user._id }).populate("images").sort({ createdAt: -1 });

        res.status(200).json(albums);
    } catch(error){
        console.error("Get albums Error: ", error);
        res.status(500).json({
            message: "Server Error"
        });
    }
};

export const addImageToAlbum = async (req, res) => {
    try{
        const { albumId, sandId } = req.body;
        
        const album = await Album.findById(albumId);

        if(!album){
            return res.status(404).json({
                message: "Album not found"
            });
        }

        if(album.userID.toString() !== req.user._id.toString()){
            return res.status(401).json({
                message: "Not Authorized"
            });
        }

        const sand = await Album.findById(sandId);

        if(!sand){
            return res.status(404).json({
                message: "Image not found"
            });
        }

        if(!album.images.includes(sandId)){
            album.images.push(sandId);
        }

        await album.save();

        return res.status(200).json({
            message: "Image added to the album",
            album,
        });
    } catch(error){
        console.error("Add Image Error: ", error);
        res.status(500).json({
            message: "Server Error"
        });
    }
};

export const removeImageFromAlbum = async(req, res) => {
    try{
        const { albumId, sandId } = req.body;
        
        const album = await Album.findById(albumId);

        if(!album){
            return res.status(404).json({
                message: "Album not found"
            });
        }

        if(album.userID.toString() !== req.user._id.toString()){
            return res.status(401).json({
                message: "Not Authorized"
            });
        }

        album.images = album.images.filter(
            (img) => img.toString() !== sandId
        );

        await album.save();

        return res.status(200).json({
            message: "Image removed to the album",
            album,
        });
    } catch(error){
        console.error("Remove Image Error: ", error);
        res.status(500).json({
            message: "Server Error"
        });
    }
};

export const renameAlbum = async(req, res) => {
    try{
        const { albumId, name } = req.body;
        
        const album = await Album.findById(albumId);

        if(!album){
            return res.status(404).json({
                message: "Album not found"
            });
        }

        if(album.userID.toString() !== req.user._id.toString()){
            return res.status(401).json({
                message: "Not Authorized"
            });
        }

        album.name = name;

        await album.save();

        return res.status(200).json({
            message: "Album renamed",
            album,
        });
    } catch(error){
        console.error("Rename Album Error: ", error);
        res.status(500).json({
            message: "Server Error"
        });
    }
};

export const deleteAlbum = async(req, res) => {
    try{
        const album = await Album.findById(req.params.id);

        if(!album){
            return res.status(404).json({
                message: "Album not found"
            });
        }

        if(album.userID.toString() !== req.user._id.toString()){
            return res.status(401).json({
                message: "Not Authorized"
            });
        }

        await album.deleteOne();

        return res.status(200).json({
            message: "Album Deleted",
            album,
        });
    } catch(error){
        console.error("Delete Album Error: ", error);
        res.status(500).json({
            message: "Server Error"
        });
    }
};