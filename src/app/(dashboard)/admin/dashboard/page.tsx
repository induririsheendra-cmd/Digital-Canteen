import prisma from "@/lib/prisma";
import AdminDashboardClient from "./AdminDashboardClient";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function AdminDashboardPage() {
    const session = await auth();

    // Secure route: only admin
    const userWithRole = session?.user as any;
    if (userWithRole?.role !== "ADMIN") {
        redirect("/home");
    }

    // Pull active orders (not completed or cancelled)
    const activeOrders = await prisma.order.findMany({
        where: {
            status: {
                in: ["PENDING", "COOKING", "READY"]
            }
        },
        include: {
            user: true, // Phase 6: Inject User Profile
            orderItems: {
                include: {
                    menuItem: true
                }
            }
        },
        orderBy: {
            createdAt: 'asc'
        }
    });

    return <AdminDashboardClient initialOrders={activeOrders} />;
}
