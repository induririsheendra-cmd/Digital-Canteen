import prisma from "@/lib/prisma";
import UsersClient from "./UsersClient";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function AdminUsersPage() {
    const session = await auth();
    const userWithRole = session?.user as any;
    if (userWithRole?.role !== "ADMIN") {
        redirect("/home");
    }

    const users = await prisma.user.findMany({
        where: {
            role: "USER" // Exclude admin users
        },
        select: {
            id: true,
            username: true,
            name: true,
            email: true,
            role: true,
            userType: true,
            rollNumber: true,
            semester: true,
            department: true,
            isDeleted: true,
            createdAt: true,
            orders: {
                include: {
                    orderItems: {
                        include: {
                            menuItem: true
                        }
                    }
                },
                orderBy: {
                    createdAt: 'desc'
                }
            }
        },
        orderBy: {
            createdAt: 'desc'
        }
    });

    return <UsersClient initialUsers={users} />;
}
