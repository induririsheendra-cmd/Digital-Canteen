import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const session = await auth();

        // Only allow admins to update order statuses
        const userWithRole = session?.user as any;
        if (userWithRole?.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { status } = body;

        const currentOrder = await prisma.order.findUnique({ where: { id } });
        if (!currentOrder) return NextResponse.json({ error: "Order not found" }, { status: 404 });

        const updatedOrder = await prisma.order.update({
            where: { id },
            data: { 
                status,
                isNotified: status !== currentOrder.status ? false : undefined
            }
        });

        // Notifications based on the new status
        let message = '';
        if (status === 'COOKING') message = '👨‍🍳 Your order is being prepared! It will be ready soon.';
        if (status === 'READY') message = '🍽 Your order is ready! Please pick it up.';
        if (status === 'COMPLETED') message = '✅ Order picked up! Hope you enjoy your meal. Please leave a review!';

        if (message) {
            const existing = await prisma.notification.findFirst({
                where: {
                    userId: updatedOrder.userId,
                    message,
                    type: 'ORDER',
                }
            });

            if (!existing) {
                await prisma.notification.create({
                    data: {
                        userId: updatedOrder.userId,
                        message,
                        type: 'ORDER',
                        link: '/orders',
                    }
                });
            }
        }

        return NextResponse.json({ success: true, order: updatedOrder });

    } catch (error) {
        console.error("Order Update Error:", error);
        return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
    }
}
