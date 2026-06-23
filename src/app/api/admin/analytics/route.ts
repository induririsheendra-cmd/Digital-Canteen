import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET(req: Request) {
    try {
        const session = await auth();
        const userWithRole = session?.user as any;
        if (userWithRole?.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const dateStr = searchParams.get("date"); // e.g., "2026-03-12"

        let startDate: Date;
        let endDate: Date;

        if (dateStr) {
            startDate = new Date(dateStr + "T00:00:00");
            endDate = new Date(dateStr + "T23:59:59.999");
        } else {
            startDate = new Date();
            startDate.setHours(0, 0, 0, 0);
            endDate = new Date();
            endDate.setHours(23, 59, 59, 999);
        }

        const orders = await prisma.order.findMany({
            where: {
                createdAt: { gte: startDate, lte: endDate },
            },
            include: {
                user: {
                    select: { name: true, username: true, rollNumber: true, semester: true, department: true, email: true, userType: true },
                },
                orderItems: { include: { menuItem: true } },
            },
            orderBy: { createdAt: "desc" },
        });

        // Calculate metrics
        const nonCancelled = orders.filter(o => o.status !== "CANCELLED" && o.status !== "REFUNDED");
        const dailyRevenue = nonCancelled.reduce((sum, o) => sum + o.totalAmount, 0);
        const totalOrders = orders.length;

        // Most popular item
        const itemCounts: Record<string, { count: number; name: string }> = {};
        nonCancelled.forEach(order => {
            order.orderItems.forEach(item => {
                if (!itemCounts[item.menuItemId]) {
                    itemCounts[item.menuItemId] = { count: 0, name: item.menuItem.name };
                }
                itemCounts[item.menuItemId].count += item.quantity;
            });
        });

        let popularItem = { name: "N/A", count: 0 };
        for (const [, data] of Object.entries(itemCounts)) {
            if (data.count > popularItem.count) {
                popularItem = data;
            }
        }

        // Get dates that have orders (for calendar highlights) — last 90 days
        const ninetyDaysAgo = new Date();
        ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
        ninetyDaysAgo.setHours(0, 0, 0, 0);

        const allRecentOrders = await prisma.order.findMany({
            where: { createdAt: { gte: ninetyDaysAgo } },
            select: { createdAt: true },
        });

        const orderDates = [...new Set(allRecentOrders.map(o => {
            const d = new Date(o.createdAt);
            return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        }))];

        return NextResponse.json({
            metrics: {
                dailyRevenue,
                totalOrders,
                popularItem: popularItem.name,
            },
            orders,
            orderDates,
        });

    } catch (error) {
        console.error("Analytics API error:", error);
        return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 });
    }
}
