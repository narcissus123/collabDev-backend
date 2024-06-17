import multer from "multer";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { Request } from "express";

// eslint-disable-next-line
type DestinationCallback = (error: Error | null, destination: string) => void;
// eslint-disable-next-line
type FileNameCallback = (error: Error | null, filename: string) => void;
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const multerStorage = multer.diskStorage({
  destination: function (
    _req: Request,
    _file: Express.Multer.File,
    cb: DestinationCallback
  ) {
    cb(null, `${__dirname}/../public/userProfileImages`);
  },

  filename: function (
    req: Request,
    file: Express.Multer.File,
    cb: FileNameCallback
  ) {
    const ext = file.mimetype.split("/")[1];
    cb(null, `user-${req.params.userId}-${Date.now()}.${ext}`);
  },
});

export const upload = multer({ storage: multerStorage });
