import path from 'path';
import fs from 'fs'
import { fileURLToPath } from 'url';

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

const upload = async (fileObjArray) => {
    let images = [];

    if (!Array.isArray(fileObjArray)) {
        return { success: false, message: "File array is missing or not provided" };
    }

    if (fileObjArray.length > 5) {
        return { success: false, message: "Exceeded maximum limit of 5 files" };
    }

    let hasInvalidFiles = false;
    let hasSizeExceededFiles = false;

    fileObjArray.forEach((fileObj, index) => {
        if (fileObj.size > 50 * 1024 * 1024) {
            hasSizeExceededFiles = true;
            return;
        }

        if (path.extname(fileObj.originalname) !== '.zip') {
            hasInvalidFiles = true;
        } else {
            const originalFilename = fileObj.originalname;
            const extname = path.extname(originalFilename);
            const timestamp = Date.now();

            const image = `${timestamp}${extname}`;

            const __filename = fileURLToPath(import.meta.url);
            const __dirname = path.dirname(__filename);
            let uploadPath = path.join(__dirname, '../public/image/', image);
            let outStream = fs.createWriteStream(uploadPath);
            outStream.write(fileObj.buffer);
            outStream.end();
            images.push(image);
        }
    });

    if (hasSizeExceededFiles) {
        return { success: false, message: "Each file size should not exceed 50MB" };
    }

    if (hasInvalidFiles) {
        return { success: false, message: "Only zip files are allowed" };
    }

    return { success: true, images };
}



export {
    fileValidation,
    upload
}