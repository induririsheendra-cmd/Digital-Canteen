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

        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const userWithRole = session.user as any;
        const isAdmin = userWithRole.role === "ADMIN";

        const body = await req.json();
        const { status } = body;

        const currentOrder = await prisma.order.findUnique({ where: { id } });
        if (!currentOrder) {
            return NextResponse.json({ error: "Order not found" }, { status: 404 });
        }

        const isOwner = currentOrder.userId === session.user.id;

        // Validation: Admins can update status, users can only cancel their own pending orders
        if (!isAdmin) {
            if (!isOwner) {
                return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
            }
            if (status !== "CANCELLED" && status !== "REFUNDED") {
                return NextResponse.json({ error: "Unauthorized action" }, { status: 403 });
            }
            if (currentOrder.status !== "PENDING") {
                return NextResponse.json({ error: "Only pending orders can be cancelled" }, { status: 400 });
            }
        }

        // Auto-upgrade status to REFUNDED if cancelling a paid order
        let targetStatus = status;
        if ((status === "CANCELLED" || status === "REFUNDED") && currentOrder.paymentId) {
            targetStatus = "REFUNDED";
        } else if (status === "REFUNDED" && !currentOrder.paymentId) {
            targetStatus = "CANCELLED";
        }

        const updatedOrder = await prisma.order.update({
            where: { id },
            data: { 
                status: targetStatus,
                isNotified: targetStatus !== currentOrder.status ? false : undefined
            }
        });

        // Notifications based on the new status
        let message = '';
        if (targetStatus === 'COOKING') message = '👨‍🍳 Your order is being prepared! It will be ready soon.';
        if (targetStatus === 'READY') message = '🍽 Your order is ready! Please pick it up.';
        if (targetStatus === 'COMPLETED') message = '✅ Order picked up! Hope you enjoy your meal. Please leave a review!';
        if (targetStatus === 'CANCELLED') message = '❌ Your order has been cancelled.';
        if (targetStatus === 'REFUNDED') message = '💸 Your order has been cancelled and a refund has been initiated.';

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
