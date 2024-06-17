import { Router } from "express";
import * as userController from "../controllers/userController";
import * as authController from "../controllers/authController";
import { userDataConvertor } from "../middleware/userDataConvertor.middleware";
import { upload } from "../middleware/fileUpload.middleware";

const uploadUserImages = upload.fields([
  { name: "avatar", maxCount: 1 },
  { name: "badges", maxCount: 12 },
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

export default router;
