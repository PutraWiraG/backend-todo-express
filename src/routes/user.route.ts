import { Router } from "express";
import * as userController from "../controllers/user.controller";
import { validate } from "../middlewares/validation.middleware";
import {
    createUserSchema,
    updateUserSchema,
} from "../validations/user.validation";

const router = Router();

router.get("/", userController.index);

router.get("/:id", userController.show);

router.post(
    "/",
    validate(createUserSchema),
    userController.store
);

router.put(
    "/:id",
    validate(updateUserSchema),
    userController.update
);

router.delete("/:id", userController.destroy);

export default router;