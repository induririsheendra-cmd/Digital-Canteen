import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { cartItems, totalAmount, notes } = body;

        if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
            return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
        }

        // --- ENFORCE MEAL TIMINGS AT CHECKOUT ---
        const mealTimings = await prisma.mealTiming.findMany();

        const isCategoryOpen = (catId: string) => {
            const timing = mealTimings.find(t => t.category === catId);
            if (!timing) return true; // Default open
            if (timing.isManualOpen) return true;

            const now = new Date();
            const currentTime = now.getHours() * 60 + now.getMinutes();

            const [startH, startM] = timing.startTime.split(':').map(Number);
            const [endH, endM] = timing.endTime.split(':').map(Number);
            const startMins = startH * 60 + startM;
            const endMins = endH * 60 + endM;

            return currentTime >= startMins && currentTime <= endMins;
        };

        const validItems = cartItems.filter((item: any) => isCategoryOpen(item.menuItem.category));

        if (validItems.length === 0) {
            return NextResponse.json({
                error: `Cannot checkout. None of the items in your cart are currently available.`
            }, { status: 400 });
        }

        // Recalculate total strictly based on valid items to prevent spoofing
        const computedSubtotal = validItems.reduce((acc: number, item: any) => acc + (item.menuItem.price * item.quantity), 0);
        const computedTax = computedSubtotal * 0.05;
        const verifiedTotal = computedSubtotal + computedTax;
        // ------------------------------------------

        // Create the order and nested orderItems in a single transaction
        const newOrder = await prisma.order.create({
            data: {
                userId: session.user.id,
                totalAmount: parseFloat(verifiedTotal.toFixed(2)),
                status: "PENDING",
                notes: notes || null,
                orderItems: {
                    create: validItems.map((item: any) => ({
                        menuItemId: item.menuItem.id,
                        quantity: item.quantity,
                        priceAtTime: item.menuItem.price
                    }))
                }
            },
            include: {
                orderItems: true
            }
        });

        // Notify Admin(s) of new order — target admins specifically, not global broadcast
        const admins = await prisma.user.findMany({
            where: { role: 'ADMIN' },
            select: { id: true }
        });

        await Promise.all(admins.map(admin =>
            prisma.notification.create({
                data: {
                    userId: admin.id,
                    message: `New Order Placed! Total: ₹${totalAmount.toFixed(2)}`,
                    type: 'ORDER',
                    link: '/admin/dashboard',
                }
            })
        ));

        return NextResponse.json({ success: true, order: newOrder }, { status: 201 });

    } catch (error) {
        console.error("Order Creation Error:", error);
        return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
    }
}
