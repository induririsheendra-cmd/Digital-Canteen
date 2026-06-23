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

    // Fetch users with their orders and items ordered
    const users = await prisma.user.findMany({
        where: {
            role: "USER" // Exclude admin users
        },
        include: {
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
