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

async function zipFileValidation(file) {
    try {
        const fileTypes = ["application/zip", ".zip"];
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



export {
    fileValidation,
    zipFileValidation
}