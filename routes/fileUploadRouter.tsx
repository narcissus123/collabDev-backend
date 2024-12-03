import { Router } from "express";
import * as authController from "../controllers/authController";
import { uploadToS3 } from "../middleware/s3Upload.middleware";
import * as fileUploadController from "../controllers/fileUploadController";

const router: Router = Router();
router.route("/:userId/:fileType")
  .get(fileUploadController.getFileUrl) // Get presigned URL for viewing
  .post(
    authController.protect,
    uploadToS3.fields([
      { name: 'avatars', maxCount: 1 },
      { name: 'badges', maxCount: 10 },
      { name: 'resume', maxCount: 1 }
    ]),
    fileUploadController.uploadFile
  )
  .delete(authController.protect, fileUploadController.deleteFile);

export default router;
