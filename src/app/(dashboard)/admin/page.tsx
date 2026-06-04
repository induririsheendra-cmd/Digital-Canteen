import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import AdminOverviewClient from "./AdminOverviewClient";

export default async function AdminPage() {
    const session = await auth();
    const userWithRole = session?.user as any;

    if (userWithRole?.role !== "ADMIN") {
        redirect("/home");
    }

    // Fetch summary data
    const [
        pendingOrders,
        cookingOrders,
        readyOrders,
        lowStockItems,
        pendingComplaints,
        todayOrders
    ] = await Promise.all([
        prisma.order.count({ where: { status: "PENDING" } }),
        prisma.order.count({ where: { status: "COOKING" } }),
        prisma.order.count({ where: { status: "READY" } }),
        prisma.menuItem.count({
            where: {
                stock: { lte: prisma.menuItem.fields.lowStockThreshold as any } // Workaround for field comparison in count if needed, but let's use a simple query
            }
        }),
        prisma.complaint.count({ where: { status: "PENDING" } }),
        prisma.order.findMany({
            where: {
                createdAt: {
                    gte: new Date(new Date().setHours(0, 0, 0, 0))
                },
                status: { not: "CANCELLED" }
            },
            select: { totalAmount: true }
        })
    ]);

    // Precise low stock items check
    const menuItems = await prisma.menuItem.findMany({
        select: { stock: true, lowStockThreshold: true }
    });
    const lowStockCount = menuItems.filter(item => item.stock <= item.lowStockThreshold).length;

    const todaySales = todayOrders.reduce((sum, order) => sum + order.totalAmount, 0);

    const stats = {
        pendingOrders,
        cookingOrders,
        readyOrders,
        lowStockItems: lowStockCount,
        pendingComplaints,
        averageRating: 0, // Placeholder
        todaySales
    };

    return <AdminOverviewClient stats={stats} />;
}
