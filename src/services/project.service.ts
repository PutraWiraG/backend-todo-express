import { prisma } from "../config/database";
import { Prisma } from "../generated/prisma/client";

export const getProjects = async (
    page: number,
    limit: number,
    all: boolean
) => {
    const queryOptions: any = {
        include: {
            createdBy: true,
        },
        orderBy: {
            createdAt: "desc",
        },
    };

    if (all) {
        const projects = await prisma.project.findMany(queryOptions);
        return { data: projects };
    }

    const skip = (page - 1) * limit;

    const [projects, total] = await Promise.all([
        prisma.project.findMany({
            ...queryOptions,
            skip,
            take: limit,
        }),
        prisma.project.count(),
    ]);

    return {
        data: projects,
        meta: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    };
};

export const getProjectById = async (id: string) => {
    return prisma.project.findUnique({
        where: { id },
        include: {
            createdBy: true,
        },
    });
};

export const createProject = async (
    name: string,
    description: string | undefined,
    createdById: string
) => {
    // Menggunakan transaction agar data project dan log tersimpan bersamaan
    return prisma.$transaction(async (tx) => {
        const project = await tx.project.create({
            data: {
                name,
                description,
                createdBy: {
                    connect: {
                        id: createdById,
                    },
                },
            },
        });

        await tx.auditLog.create({
            data: {
                entityType: "PROJECT",
                entityId: project.id,
                action: "CREATE",
                oldValue: Prisma.DbNull,
                newValue: project as any,
                actorId: createdById,
            },
        });

        return project;
    });
};

export const updateProject = async (
    id: string,
    name: string,
    description?: string,
    actorId?: string
) => {
    return prisma.$transaction(async (tx) => {
        const oldProject = await tx.project.findUnique({
            where: { id },
        });

        if (!oldProject) throw new Error("Project not found");

        const updatedProject = await tx.project.update({
            where: { id },
            data: {
                name,
                description,
            },
        });

        if (actorId) {
            await tx.auditLog.create({
                data: {
                    entityType: "PROJECT",
                    entityId: id,
                    action: "UPDATE",
                    oldValue: oldProject as any,
                    newValue: updatedProject as any,
                    actorId: actorId,
                },
            });
        }

        return updatedProject;
    });
};

export const deleteProject = async (id: string, actorId: string) => {
    return prisma.$transaction(async (tx) => {
        const oldProject = await tx.project.findUnique({
            where: { id },
        });

        if (!oldProject) throw new Error("Project not found");

        await tx.project.delete({
            where: { id },
        });

        await tx.auditLog.create({
            data: {
                entityType: "PROJECT",
                entityId: id,
                action: "DELETE",
                oldValue: oldProject as any,
                newValue: Prisma.DbNull,
                actorId: actorId,
            },
        });
    });
};