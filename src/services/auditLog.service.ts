import { prisma } from "../config/database";

export const getAuditLogs = async (page: number, limit: number) => {
    const skip = (page - 1) * limit;

    const [logs, total] = await Promise.all([
        prisma.auditLog.findMany({
            skip,
            take: limit,
            orderBy: {
                createdAt: "desc", // Urutkan dari yang terbaru
            },
            include: {
                actor: {
                    select: {
                        id: true,
                        username: true,
                        fullName: true,
                    },
                },
            },
        }),
        prisma.auditLog.count(),
    ]);

    return {
        data: logs,
        meta: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    };
};