import { Router } from "express";
import * as authController from "../controllers/authController";
import * as requestController from "../controllers/requestController";
const router = Router();
router.route("/").post(authController.protect, requestController.createRequest);
router
    .route("/:requestId")
    .delete(authController.protect, requestController.deleteUserRequest);
router
    .route("/:userId")
    .get(authController.protect, requestController.getUserRequests);
router
    .route("/accept/:requestId")
    .put(authController.protect, requestController.acceptUserRequest);
router
    .route("/reject/:requestId")
    .put(authController.protect, requestController.rejectUserRequest);
export default router;
