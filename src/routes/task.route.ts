import { Router } from "express";
import * as taskController from "../controllers/task.controller";
import { validate } from "../middlewares/validation.middleware";
import {
    createTaskSchema,
    deleteTaskSchema,
    updateTaskSchema,
    updateTaskStatusSchema,
} from "../validations/task.validation";

const router = Router();

router.get("/", taskController.index);
router.get("/:id", taskController.show);

router.post(
    "/",
    validate(createTaskSchema),
    taskController.store
);

router.put(
    "/:id",
    validate(updateTaskSchema),
    taskController.update
);

router.patch(
    "/:id/status",
    validate(updateTaskStatusSchema),
    taskController.updateStatus
);

router.delete(
    "/:id",
    validate(deleteTaskSchema),
    taskController.destroy
);

router.get("/:id/history", taskController.history);

export default router;