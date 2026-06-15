import { Router } from "express";
import userRoutes from "./user.route";
import projectRoutes from "./project.route";
import taskRoutes from "./task.route";
import auditLogRoutes from "./auditLog.route";

const router = Router();

router.get("/health", (_, res) => {
    res.json({
        success: true,
        message: "OK",
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
    });
});

router.use("/users", userRoutes);
router.use("/projects", projectRoutes);
router.use("/tasks", taskRoutes);
router.use("/audit-logs", auditLogRoutes);

export default router;