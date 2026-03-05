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

        const updatedOrder = await prisma.order.update({
            where: { id },
            data: { status }
        });

        // Only notify on statuses the user cares about, and prevent duplicates
        if (status === 'READY' || status === 'COMPLETED') {
            const message = status === 'READY'
                ? '🍽 Your order is ready! Please pick it up.'
                : '✅ Your order has been completed. Leave a review!';

            // Check for existing notification with same message for this order
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
