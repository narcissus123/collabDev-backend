import * as contributionController from "../controllers/contributionController";
import express from "express";
const router = express.Router();

router.get(
  "/projects/:projectId/contributors",
  contributionController.findContributorsForProject
);
module.exports = router;
