import fs from 'fs';
import path from 'path';

function deleteFile(imageName) {
    const imagePath = path.join('public', 'image', imageName);
    if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
        return { success: true, message: "File deleted successfully" };
    } else {
        return { success: false, message: "File not found" };
    }
}

export {
    deleteFile
}