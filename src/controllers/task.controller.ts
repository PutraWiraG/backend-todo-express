import { Request, Response, NextFunction } from "express";
import * as taskService from "../services/task.service";
import { errorResponse, successResponse } from "../utils/response";
import dayjs from "dayjs";

type TaskParams = { id: string };
type TaskQuery = { page?: string; limit?: string; all?: string; projectId?: string };

export const index = async (req: Request<{}, {}, {}, TaskQuery>, res: Response, next: NextFunction) => {
    try {
        const page = parseInt(req.query.page ?? "1");
        const limit = parseInt(req.query.limit ?? "10");
        const all = req.query.all === "true";
        const projectId = req.query.projectId ?? "";

        if (!projectId && !all) {
            return errorResponse(res, { statusCode: 400, message: "projectId is required" });
        }

        const result = await taskService.getTasks(projectId, page, limit, all);

        return successResponse(res, {
            message: "Tasks retrieved successfully",
            data: result.data,
            ...(result.meta && { meta: result.meta }),
        });
    } catch (error) { next(error); }
};

export const show = async (req: Request<TaskParams>, res: Response, next: NextFunction) => {
    try {
        const task = await taskService.getTaskById(req.params.id);
        if (!task) {
            return errorResponse(res, { statusCode: 404, message: "Task not found" });
        }
        return successResponse(res, { message: "Task retrieved successfully", data: task });
    } catch (error) { next(error); }
};

export const store = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const actorId = req.body.actorId || req.body.createdById;
        const task = await taskService.createTask(req.body, actorId);

        return successResponse(res, { statusCode: 201, message: "Task created successfully", data: task });
    } catch (error) { next(error); }
};

export const update = async (req: Request<TaskParams>, res: Response, next: NextFunction) => {
    try {
        const task = await taskService.updateTask(req.params.id, req.body, req.body.actorId);
        return successResponse(res, { message: "Task updated successfully", data: task });
    } catch (error) { next(error); }
};

// Fungsi baru untuk Update Status
export const updateStatus = async (req: Request<TaskParams>, res: Response, next: NextFunction) => {
    try {
        const task = await taskService.updateTaskStatus(req.params.id, req.body.status, req.body.actorId);
        return successResponse(res, { message: "Task status updated successfully", data: task });
    } catch (error) { next(error); }
};

export const destroy = async (req: Request<TaskParams>, res: Response, next: NextFunction) => {
    try {
        await taskService.deleteTask(req.params.id, req.body.actorId);
        return successResponse(res, { message: "Task deleted successfully" });
    } catch (error) { next(error); }
};

export const history = async (
    req: Request<TaskParams>,
    res: Response,
    next: NextFunction
) => {
    try {
        const logs = await taskService.getTaskHistory(req.params.id);

        if (!logs.length) {
            // Jika kosong, mungkin task belum ada atau log terhapus (seharusnya tidak terjadi)
            return successResponse(res, {
                message: "No history found for this task",
                data: [],
            });
        }

        // Format data agar lebih ramah dibaca (human-readable)
        const formattedHistory = logs.map((log) => {
            const actorName = log.actor?.fullName || log.actor?.username || "System";
            const time = dayjs(log.createdAt).format("YYYY-MM-DD HH:mm");
            let actionText = "";

            switch (log.action) {
                case "CREATE":
                    actionText = `Task created by ${actorName}`;
                    break;
                case "STATUS_CHANGE":
                    actionText = `Status changed from "${log.fromStatus}" to "${log.toStatus}" by ${actorName}`;
                    break;
                case "UPDATE":
                    actionText = `Task details updated by ${actorName}`;
                    break;
                case "DELETE":
                    actionText = `Task deleted by ${actorName}`;
                    break;
                default:
                    actionText = `Task ${log.action.toLowerCase()}d by ${actorName}`;
            }

            return {
                id: log.id,
                action: log.action,
                message: `${actionText} at ${time}`, // Kalimat jadi untuk frontend
                fromStatus: log.fromStatus,
                toStatus: log.toStatus,
                actor: log.actor,
                createdAt: log.createdAt,
            };
        });

        return successResponse(res, {
            message: "Task history retrieved successfully",
            data: formattedHistory,
        });
    } catch (error) {
        next(error);
    }
};