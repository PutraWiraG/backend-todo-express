import { Request, Response, NextFunction } from "express";
import {
    createProject,
    deleteProject,
    getProjectById,
    getProjects,
    updateProject,
} from "../services/project.service";
import {
    errorResponse,
    successResponse,
} from "../utils/response";

type ProjectParams = {
    id: string;
};

type ProjectQuery = {
    page?: string;
    limit?: string;
    all?: string;
};

type ProjectBody = {
    name: string;
    description?: string;
    createdById: string;
    actorId: string;
};

export const index = async (
    req: Request<{}, {}, {}, ProjectQuery>,
    res: Response,
    next: NextFunction
) => {
    try {
        const page = parseInt(req.query.page ?? "1");
        const limit = parseInt(req.query.limit ?? "10");
        const all = req.query.all === "true";

        const result = await getProjects(page, limit, all);

        return successResponse(res, {
            message: "Projects retrieved successfully",
            data: result.data,
            meta: result.meta,
        });
    } catch (error) {
        next(error);
    }
};

export const show = async (
    req: Request<ProjectParams>,
    res: Response,
    next: NextFunction
) => {
    try {
        const project = await getProjectById(req.params.id);

        if (!project) {
            return errorResponse(res, {
                statusCode: 404,
                message: "Project not found",
            });
        }

        return successResponse(res, {
            message: "Project retrieved successfully",
            data: project,
        });
    } catch (error) {
        next(error);
    }
};

export const store = async (
    req: Request<{}, {}, ProjectBody>,
    res: Response,
    next: NextFunction
) => {
    try {
        const project = await createProject(
            req.body.name,
            req.body.description,
            req.body.createdById
        );

        return successResponse(res, {
            statusCode: 201,
            message: "Project created successfully",
            data: project,
        });
    } catch (error) {
        next(error);
    }
};

export const update = async (
    req: Request<ProjectParams, {}, ProjectBody>,
    res: Response,
    next: NextFunction
) => {
    try {
        const project = await updateProject(
            req.params.id,
            req.body.name,
            req.body.description,
            req.body.actorId,
        );

        return successResponse(res, {
            message: "Project updated successfully",
            data: project,
        });
    } catch (error) {
        next(error);
    }
};

export const destroy = async (
    req: Request<ProjectParams>,
    res: Response,
    next: NextFunction
) => {
    try {
        await deleteProject(req.params.id, req.body.actorId);

        return successResponse(res, {
            message: "Project deleted successfully",
        });
    } catch (error) {
        next(error);
    }
};