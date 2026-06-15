import { prisma } from "../config/database";

export const getUsers = async (
    page: number,
    limit: number,
    all: boolean
) => {
    if (all) {
        const users = await prisma.user.findMany({
            orderBy: {
                createdAt: "desc",
            },
        });

        return {
            data: users,
        };
    }

    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
        prisma.user.findMany({
            skip,
            take: limit,
            orderBy: {
                createdAt: "desc",
            },
        }),
        prisma.user.count(),
    ]);

    return {
        data: users,
        meta: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    };
};

export const getUserById = async (id: string) => {
    return prisma.user.findUnique({
        where: {
            id,
        },
    });
};

export const createUser = async (
    username: string,
    fullName: string
) => {
    return prisma.user.create({
        data: {
            username,
            fullName,
        },
    });
};

export const updateUser = async (
    id: string,
    username: string,
    fullName: string
) => {
    return prisma.user.update({
        where: {
            id,
        },
        data: {
            username,
            fullName,
        },
    });
};

export const deleteUser = async (id: string) => {
    return prisma.user.delete({
        where: {
            id,
        },
    });
};