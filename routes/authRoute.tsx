import express, { Router } from "express";
import * as authController from "../controllers/authController";

const router: Router = express.Router();
router.route("/signup").post(authController.signup);
router.route("/login").post(authController.login);
router.route("/change-password").post(authController.forgetPassword);

export default router;
