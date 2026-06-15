import { Router } from "express";
import * as auditLogController from "../controllers/auditLog.controller";

const router = Router();

router.get("/", auditLogController.index);

export default router;