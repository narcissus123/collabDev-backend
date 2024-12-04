import multer from "multer";
import { fileURLToPath } from "url";
import { dirname } from "path";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const multerStorage = multer.diskStorage({
    destination: function (_req, _file, cb) {
        cb(null, `${__dirname}/../public/userProfileImages`);
    },
    filename: function (req, file, cb) {
        const ext = file.mimetype.split("/")[1];
        cb(null, `user-${req.params.userId}-${Date.now()}.${ext}`);
    },
});
export const upload = multer({ storage: multerStorage });
