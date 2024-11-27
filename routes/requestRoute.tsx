import { Router } from "express";
import * as authController from "../controllers/authController";
import * as requestController from "../controllers/requestController";
// import { userDataConvertor } from "../middleware/userDataConvertor.middleware";

const router: Router = Router();

router.route("/").post(authController.protect, requestController.createRequest);

router
  .route("/:requestId")
  .get(authController.protect, requestController.getUserRequests)
  .delete(authController.protect, requestController.deleteUserRequest);

router
  .route("/accept/:requestId")
  .put(authController.protect, requestController.acceptUserRequest);

router
  .route("/reject")
  .put(authController.protect, requestController.rejectUserRequest);

export default router;
