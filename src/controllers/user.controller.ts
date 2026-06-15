import { Request, Response, NextFunction } from "express";
import {
    createUser,
    deleteUser,
    getUserById,
    getUsers,
    updateUser,
} from "../services/user.service";
import {
    errorResponse,
    successResponse,
} from "../utils/response";

type UserParams = {
    id: string;
};

type UserQuery = {
    page?: string;
    limit?: string;
    all?: string;
};

type UserBody = {
    username: string;
    fullName: string;
};

export const index = async (
    req: Request<{}, {}, {}, UserQuery>,
    res: Response,
    next: NextFunction
) => {
    try {
        const page = parseInt(req.query.page ?? "1");
        const limit = parseInt(req.query.limit ?? "10");
        const all = req.query.all === "true";

        const result = await getUsers(page, limit, all);

        return successResponse(res, {
            message: "Users retrieved successfully",
            data: result.data,
            meta: result.meta,
        });
    } catch (error) {
        next(error);
    }
};

export const show = async (
    req: Request<UserParams>,
    res: Response,
    next: NextFunction
) => {
    try {
        const user = await getUserById(req.params.id);

        if (!user) {
            return errorResponse(res, {
                statusCode: 404,
                message: "User not found",
            });
        }

        return successResponse(res, {
            message: "User retrieved successfully",
            data: user,
        });
    } catch (error) {
        next(error);
    }
};

export const store = async (
    req: Request<{}, {}, UserBody>,
    res: Response,
    next: NextFunction
) => {
    try {
        const user = await createUser(
            req.body.username,
            req.body.fullName
        );

        return successResponse(res, {
            statusCode: 201,
            message: "User created successfully",
            data: user,
        });
    } catch (error) {
        next(error);
    }
};

export const update = async (
    req: Request<UserParams, {}, UserBody>,
    res: Response,
    next: NextFunction
) => {
    try {
        const user = await updateUser(
            req.params.id,
            req.body.username,
            req.body.fullName
        );

        return successResponse(res, {
            message: "User updated successfully",
            data: user,
        });
    } catch (error) {
        next(error);
    }
};

export const destroy = async (
    req: Request<UserParams>,
    res: Response,
    next: NextFunction
) => {
    try {
        await deleteUser(req.params.id);

        return successResponse(res, {
            message: "User deleted successfully",
        });
    } catch (error) {
        next(error);
    }
};