import { Router } from "express";
import * as userController from "../controllers/userController.js";
import * as authController from "../controllers/authController.js";
const router = Router();
router.route("/").get(userController.getAllUsers);
router
    .route("/:userId")
    .get(userController.getUserById)
    .put(authController.protect, userController.UpdateUser);
export default router;
