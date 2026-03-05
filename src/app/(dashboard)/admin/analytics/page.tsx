import prisma from "@/lib/prisma";
import AnalyticsClient from "./AnalyticsClient";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function AdminAnalyticsPage() {
    const session = await auth();

    const userWithRole = session?.user as any;
    if (userWithRole?.role !== "ADMIN") {
        redirect("/home");
    }

    // Get today's start and end dates
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const activeOrders = await prisma.order.findMany({
        where: { createdAt: { gte: today } },
        include: {
            user: {
                select: { name: true, username: true, rollNumber: true, semester: true, department: true, email: true }
            },
            orderItems: { include: { menuItem: true } }
        }
    });

    // 1. Total Daily Revenue
    const dailyRevenue = activeOrders
        .filter(order => order.status !== "CANCELLED")
        .reduce((sum, order) => sum + order.totalAmount, 0);

    // 2. Total Order Volume
    const totalOrders = activeOrders.length;

    // 3. Most Popular Item calculation
    const itemCounts: Record<string, { count: number, name: string }> = {};
    activeOrders.forEach(order => {
        if (order.status !== "CANCELLED") {
            order.orderItems.forEach(item => {
                if (!itemCounts[item.menuItemId]) {
                    itemCounts[item.menuItemId] = { count: 0, name: item.menuItem.name };
                }
                itemCounts[item.menuItemId].count += item.quantity;
            });
        }
    });

    let popularItem = { name: "N/A", count: 0 };
    for (const [_, data] of Object.entries(itemCounts)) {
        if ((data as any).count > popularItem.count) {
            popularItem = data as any;
        }
    }

    const metrics = {
        dailyRevenue,
        totalOrders,
        popularItem: popularItem.name
    };

    return <AnalyticsClient metrics={metrics} recentOrders={activeOrders.slice(-10).reverse()} />;
}
