import { Router } from "express";
import * as projectController from "../controllers/project.controller";
import { validate } from "../middlewares/validation.middleware";
import {
    createProjectSchema,
    updateProjectSchema,
    deleteProjectSchema
} from "../validations/project.validation";

const router = Router();

router.get("/", projectController.index);

router.get("/:id", projectController.show);

router.post(
    "/",
    validate(createProjectSchema),
    projectController.store
);

router.put(
    "/:id",
    validate(updateProjectSchema),
    projectController.update
);

router.delete("/:id", validate(deleteProjectSchema), projectController.destroy);

export default router;