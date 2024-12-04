import { Router } from "express";
import * as chatMessageController from "../controllers/chatMessageController.js";
import * as authController from "../controllers/authController.js";
const router = Router();
router
    .route("/:userId")
    .get(authController.protect, chatMessageController.getUserChats);
router
    .route("/:userId/:participantId")
    .get(authController.protect, chatMessageController.getUserChatById);
export default router;
