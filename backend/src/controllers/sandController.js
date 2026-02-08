import Sand from "../models/sandModel.js"

export const saveCanvas = async (req, res) => {
    try{
        const { imagePath } = req.body;

        if(!imagePath){
            return res.status(400).json({
                message: "Image Path required!"
            });
        }

        const sand = await Sand.create({
            userID: req.user._id,
            imagePath
        });

        res.status(201).json({
            message: "Canvas Saved", sand
        });
    } catch(error){
        console.error("SandCanvas Error: ", error);
        res.status(500).json({
            message: "Server Error"
        });
    }
};