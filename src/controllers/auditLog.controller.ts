import { Request, Response, NextFunction } from "express";
import * as auditLogService from "../services/auditLog.service";
import { successResponse } from "../utils/response";
import dayjs from "dayjs"; // Import dayjs

type AuditLogQuery = {
    page?: string;
    limit?: string;
};

const generateLogMessage = (log: any): string => {
    const actorName = log.actor?.username || "System";
    const entityType = log.entityType.charAt(0).toUpperCase() + log.entityType.slice(1).toLowerCase();
    
    const newValue = log.newValue as Record<string, any> | null;
    const oldValue = log.oldValue as Record<string, any> | null;

    const entityName = newValue?.title || newValue?.name || oldValue?.title || oldValue?.name || `ID ${log.entityId}`;

    // Formatting menggunakan dayjs menjadi sangat simpel
    const formattedDate = dayjs(log.createdAt).format('YYYY-MM-DD HH:mm');

    switch (log.action) {
        case "CREATE":
            return `User "${actorName}" created ${entityType} "${entityName}" at ${formattedDate}`;
        case "UPDATE":
            return `User "${actorName}" updated ${entityType} "${entityName}" at ${formattedDate}`;
        case "DELETE":
            return `User "${actorName}" deleted ${entityType} "${entityName}" at ${formattedDate}`;
        case "STATUS_CHANGE":
            return `User "${actorName}" changed ${entityType} "${entityName}" status from "${log.fromStatus}" to "${log.toStatus}" at ${formattedDate}`;
        default:
            return `User "${actorName}" performed an action on ${entityType} "${entityName}" at ${formattedDate}`;
    }
};

export const index = async (
    req: Request<{}, {}, {}, AuditLogQuery>,
    res: Response,
    next: NextFunction
) => {
    try {
        const page = parseInt(req.query.page ?? "1");
        const limit = parseInt(req.query.limit ?? "10");

        const result = await auditLogService.getAuditLogs(page, limit);

        const formattedData = result.data.map((log) => ({
            ...log,
            message: generateLogMessage(log),
        }));

        return successResponse(res, {
            message: "Audit logs retrieved successfully",
            data: formattedData,
            meta: result.meta,
        });
    } catch (error) {
        next(error);
    }
};