import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client"; // Sesuaikan path ini

const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({
    adapter,
});

async function main() {
    console.log("🌱 Memulai seeding...");

    // 1. Seeding Users
    console.log("👤 Seeding users...");
    await prisma.user.createMany({
        data: [
            { username: "john.doe", fullName: "John Doe" },
            { username: "jane.smith", fullName: "Jane Smith" },
            { username: "admin", fullName: "Administrator" },
        ],
        skipDuplicates: true,
    });

    const admin = await prisma.user.findUnique({ where: { username: "admin" } });
    if (!admin) throw new Error("Admin user not found");

    // 2. Seeding Projects
    console.log("📁 Seeding projects...");
    await prisma.project.createMany({
        data: [
            { name: "Sistem Informasi Presensi", description: "Pengembangan sistem presensi karyawan", createdById: admin.id },
            { name: "Mini Task Manager", description: "Take home test Full Stack Developer", createdById: admin.id },
            { name: "Website Company Profile", description: "Pembuatan website company profile", createdById: admin.id },
        ],
        skipDuplicates: true,
    });

    const project = await prisma.project.findFirst({ where: { name: "Mini Task Manager" } });
    if (!project) throw new Error("Project not found");

    // 3. Seeding Tasks
    console.log("📝 Seeding tasks...");
    
    // Parent Task
    const parentTask = await prisma.task.create({
        data: {
            title: "Setup Development Environment",
            description: "Install Node.js, Database, and project dependencies",
            projectId: project.id,
            createdById: admin.id,
            status: "IN_PROGRESS",
        },
    });

    // Child Tasks
    await prisma.task.createMany({
        data: [
            {
                title: "Initialize Express App",
                description: "Setup basic server and folder structure",
                projectId: project.id,
                createdById: admin.id,
                parentId: parentTask.id,
            },
            {
                title: "Setup Prisma ORM",
                description: "Configure prisma client and database schema",
                projectId: project.id,
                createdById: admin.id,
                parentId: parentTask.id,
            },
        ],
    });

   // 4. Seeding Audit Logs
    console.log("🔍 Seeding audit logs...");
    
    // Ambil data yang diperlukan
    const taskForLog = await prisma.task.findFirst({ 
        where: { title: "Setup Development Environment" } 
    });
    
    const actor = await prisma.user.findUnique({ 
        where: { username: "john.doe" } 
    });

    if (!taskForLog || !actor) {
        console.warn("⚠️ Data tidak lengkap untuk seeding AuditLog, dilewati.");
    } else {
        // Kita gunakan createMany dengan struktur baru
        await prisma.auditLog.createMany({
            data: [
                {
                    entityType: "TASK",
                    entityId: taskForLog.id,
                    action: "STATUS_CHANGE",
                    fromStatus: "TO_DO",
                    toStatus: "IN_PROGRESS",
                    oldValue: { status: "TO_DO" }, // Contoh menyimpan state lama
                    newValue: { status: "IN_PROGRESS" }, // Contoh menyimpan state baru
                    actorId: actor.id,
                },
                {
                    entityType: "TASK",
                    entityId: taskForLog.id,
                    action: "CREATE",
                    // Untuk CREATE, oldValue bisa null atau data default
                    oldValue: null,
                    newValue: { title: "Setup Development Environment", status: "TO_DO" },
                    actorId: actor.id,
                }
            ],
        });
    }

    console.log("✅ Seeding selesai dengan sukses!");
}

main()
    .catch((error) => {
        console.error("❌ Error seeding:", error);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });