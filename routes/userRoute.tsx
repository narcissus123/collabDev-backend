import { Router } from "express";
import * as userController from "../controllers/userController";
import * as authController from "../controllers/authController";
import { userDataConvertor } from "../middleware/userDataConvertor.middleware";
import { upload } from "../middleware/fileUpload.middleware";
import { uploadToS3 } from "../middleware/s3Upload.middleware";

const uploadUserImages = upload.fields([
  { name: "avatar", maxCount: 1 },
  { name: "badges", maxCount: 12 }
]);

const router: Router = Router();
router.route("/").get(userController.getAllUsers);
router
  .route("/:userId")
  .get(userController.getUserById)
  .put(
    authController.protect,
    uploadUserImages,
    userDataConvertor,
    userController.UpdateUser
  );

router
  .route("/resume/:userId")
  .get(userController.getResumeUrl) // Get presigned URL for viewing
  .post(
    authController.protect,
    uploadToS3.single("file"),
    userController.uploadResume
  )
  .delete(authController.protect, userController.deleteResume);
