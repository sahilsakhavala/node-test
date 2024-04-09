import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

function uploadFile(fileObjArray) {
    let image = null;
    if (Array.isArray(fileObjArray) && fileObjArray.length > 0) {
        const originalFilename = fileObjArray[0].originalname;
        const extname = path.extname(originalFilename);
        const timestamp = Date.now();

        image = `${timestamp}${extname}`;

        const __filename = fileURLToPath(import.meta.url);
        const __dirname = path.dirname(__filename);

        const uploadDir = path.join(__dirname, '../public/image/');

        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        const uploadPath = path.join(uploadDir, image);

        fs.writeFileSync(uploadPath, fileObjArray[0].buffer);
    }
    return image;
}

export default uploadFile;