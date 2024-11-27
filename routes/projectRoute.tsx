import { Router } from "express";
import * as projectController from "../controllers/projectController";
import * as authController from "../controllers/authController";
import { userDataConvertor } from "../middleware/userDataConvertor.middleware";
import { upload } from "../middleware/fileUpload.middleware";
import { projectsValidator } from "../middleware/validateProject.middleware";

const uploadProjectImages = upload.fields([
  { name: "coverImage", maxCount: 1 },
  { name: "screenshots", maxCount: 12 }
]);
const router: Router = Router();
router
  .route("/")
  .get(projectController.getAllProjects)
  .post(
    authController.protect,
    uploadProjectImages,
    userDataConvertor,
    projectsValidator,
    projectController.createProject
  );

router
  .route("/:projectId")
  .get(projectController.getProjectById)
  .put(
    authController.protect,
    uploadProjectImages,
    userDataConvertor,
    projectController.updateProject
  );

router.route("/owner/:ownerId").get(projectController.getProjectsByOwnerId);

export default router;
