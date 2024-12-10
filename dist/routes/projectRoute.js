import { Router } from "express";
import * as projectController from "../controllers/projectController.js";
import * as authController from "../controllers/authController.js";
import { projectsValidator } from "../middleware/validateProject.middleware.js";
const router = Router();
router
    .route("/")
    .get(projectController.getAllProjects)
    .post(authController.protect, projectsValidator, projectController.createProject);
router
    .route("/:projectId")
    .get(projectController.getProjectById)
    .put(authController.protect, projectController.updateProject).delete(authController.protect, projectController.deleteProject);
router.post('/:projectId/collaborators/:collaboratorId', authController.protect, projectController.addCollaborator);
router.route("/owner/:ownerId").get(projectController.getProjectsByOwnerId);
export default router;
