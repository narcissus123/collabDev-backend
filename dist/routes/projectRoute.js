import { Router } from "express";
import * as projectController from "../controllers/projectController.js";
import * as authController from "../controllers/authController.js";
import { userDataConvertor } from "../middleware/userDataConvertor.middleware.js";
import { upload } from "../middleware/fileUpload.middleware.js";
import { projectsValidator } from "../middleware/validateProject.middleware.js";
const uploadProjectImages = upload.fields([
    { name: "coverImage", maxCount: 1 },
    { name: "screenshots", maxCount: 12 }
]);
const router = Router();
router
    .route("/")
    .get(projectController.getAllProjects)
    .post(authController.protect, uploadProjectImages, userDataConvertor, projectsValidator, projectController.createProject);
router
    .route("/:projectId")
    .get(projectController.getProjectById)
    .put(authController.protect, uploadProjectImages, userDataConvertor, projectController.updateProject).delete(authController.protect, projectController.deleteProject);
router.post('/:projectId/collaborators/:collaboratorId', authController.protect, projectController.addCollaborator);
router.route("/owner/:ownerId").get(projectController.getProjectsByOwnerId);
export default router;
