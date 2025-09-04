import { Router } from 'express'
import multer from 'multer'
import { uploadToR2 } from '../storage/ConfigR2.js'

export const uploadTestRoutes = Router();
const upload = multer({ storage: multer.memoryStorage() });

uploadTestRoutes.post(
    "/upload",
    upload.single("file"),
    async (req, res) => {
        try {
            const file = req.file;
            const url = await uploadToR2(
                `${Date.now()}-${file.originalname}`,
                file.buffer,
                file.mimetype
            )
            res.json({ url });
        } catch (error) {
            console.log(error)
            res.status(500).json({ error: "Upload failed somehow "})
        }
    }
)