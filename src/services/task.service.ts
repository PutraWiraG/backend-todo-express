import { prisma } from "../config/database";
import { Prisma } from "../generated/prisma/client";

export const getTasks = async (
    projectId: string,
    page: number,
    limit: number,
    all: boolean
) => {
    const queryOptions: any = {
        where: {
            projectId,
            parentId: null, // Ambil task root
            deletedAt: null, // Jangan ambil yang di-soft delete
        },
        include: {
            children: {
                where: { deletedAt: null },
                include: { children: true },
            },
        },
        orderBy: { createdAt: "desc" },
    };

    if (all) {
        const tasks = await prisma.task.findMany(queryOptions);
        return { data: tasks };
    }

    const skip = (page - 1) * limit;

    const [tasks, total] = await Promise.all([
        prisma.task.findMany({ ...queryOptions, skip, take: limit }),
        prisma.task.count({ where: queryOptions.where }),
    ]);

    return {
        data: tasks,
        meta: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    };
};

export const getTaskById = async (id: string) => {
    return prisma.task.findUnique({
        where: { id, deletedAt: null },
        include: { children: { include: { children: true } } },
    });
};

export const createTask = async (data: any, actorId: string) => {
    return prisma.$transaction(async (tx) => {
        const task = await tx.task.create({
            data: {
                title: data.title,
                description: data.description,
                projectId: data.projectId,
                createdById: data.createdById,
                parentId: data.parentId,
                children: data.children ? { create: data.children } : undefined,
            },
            include: { children: true },
        });

        await tx.auditLog.create({
            data: {
                entityType: "TASK",
                entityId: task.id,
                action: "CREATE",
                oldValue: Prisma.DbNull,
                newValue: task as any,
                actorId: actorId,
            },
        });

        return task;
    });
};

export const updateTask = async (id: string, data: any, actorId: string) => {
    return prisma.$transaction(async (tx) => {
        const oldTask = await tx.task.findUnique({ where: { id } });
        if (!oldTask) throw new Error("Task not found");

        const isStatusChanged = data.status && oldTask.status !== data.status;

        const updatedTask = await tx.task.update({
            where: { id },
            data: {
                title: data.title,
                description: data.description,
                status: data.status,
                children: data.children ? { create: data.children } : undefined,
            },
        });

        await tx.auditLog.create({
            data: {
                entityType: "TASK",
                entityId: id,
                action: isStatusChanged ? "STATUS_CHANGE" : "UPDATE",
                fromStatus: isStatusChanged ? (oldTask.status as any) : undefined,
                toStatus: isStatusChanged ? (updatedTask.status as any) : undefined,
                oldValue: oldTask as any,
                newValue: updatedTask as any,
                actorId: actorId,
            },
        });

        return updatedTask;
    });
};

export const updateTaskStatus = async (id: string, status: string, actorId: string) => {
    return prisma.$transaction(async (tx) => {
        const oldTask = await tx.task.findUnique({ where: { id } });
        if (!oldTask) throw new Error("Task not found");

        const updatedTask = await tx.task.update({
            where: { id },
            data: { status: status as any },
        });

        await tx.auditLog.create({
            data: {
                entityType: "TASK",
                entityId: id,
                action: "STATUS_CHANGE",
                fromStatus: oldTask.status as any,
                toStatus: updatedTask.status as any,
                oldValue: oldTask as any,
                newValue: updatedTask as any,
                actorId: actorId,
            },
        });

        return updatedTask;
    });
};

export const deleteTask = async (id: string, actorId: string) => {
    return prisma.$transaction(async (tx) => {
        const oldTask = await tx.task.findUnique({ where: { id } });
        if (!oldTask) throw new Error("Task not found");

        await tx.task.update({
            where: { id },
            data: { deletedAt: new Date() },
        });

        await tx.auditLog.create({
            data: {
                entityType: "TASK",
                entityId: id,
                action: "DELETE",
                oldValue: oldTask as any,
                newValue: Prisma.DbNull,
                actorId: actorId,
            },
        });
    });
};

export const getTaskHistory = async (id: string) => {
    return prisma.auditLog.findMany({
        where: {
            entityType: "TASK",
            entityId: id,
        },
        orderBy: {
            createdAt: "asc", // Urutkan dari yang paling awal terjadi
        },
        include: {
            actor: {
                select: {
                    id: true,
                    username: true,
                    fullName: true, // Ambil nama lengkap untuk ditampilkan
                },
            },
        },
    });
};