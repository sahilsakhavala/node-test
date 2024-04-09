import path from 'path';
import fs from 'fs'

async function fileValidation(file) {
    try {
        const fileTypes = ["image/jpeg", "image/jpg", "image/png", "image/svg"];
        for (const obj of file) {
            if (!fileTypes.includes(obj.mimetype)) {
                return { success: false, message: "File type not supported" };
            };

            if (obj.size > 5 * 1024 * 1024) {
                return { success: false, message: "Image must be less than 5MB" };
            }
        }
        return { success: true };
    } catch (error) {
        return { success: false, message: "Somthing went wrong in file validation" };
    }
}

const upload = async (fileObjArray, req, res) => {
    let images = [];

    if (!Array.isArray(fileObjArray)) {
        return res.status(400).json({ success: false, message: "File array is missing or not provided" });
    }

    let hasInvalidFiles = false;

    fileObjArray.forEach((fileObj, index) => {
        if (path.extname(fileObj.originalname) !== '.zip') {
            hasInvalidFiles = true;
        } else {
            let image = `${Date.now()}_${index}${path.extname(fileObj.originalname)}`;
            let uploadPath = path.join(image, '../public/image', `${Date.now()}` + image);
            let outStream = fs.createWriteStream(uploadPath);
            outStream.write(fileObj.buffer);
            outStream.end();
            images.push(image);
        }
    });

    if (hasInvalidFiles) {
        return { success: false, message: "Only zip files are allowed" };
    }

    return { success: true, images };
}


export {
    fileValidation,
    upload
}