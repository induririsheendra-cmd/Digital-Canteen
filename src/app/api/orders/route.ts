import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
    try {
        const session = await auth();
        const userId = session?.user?.id;

        if (!userId) {
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

        // Create the order, nested orderItems, and update stock in a single transaction
        const { newOrder, lowStockItems } = await prisma.$transaction(async (tx) => {
            const lowStockAlerts: { id: string, name: string, stock: number }[] = [];

            // 1. Double check stock for all items
            for (const item of validItems) {
                const menuItem = await tx.menuItem.findUnique({
                    where: { id: item.menuItem.id },
                    select: { id: true, name: true, stock: true, lowStockThreshold: true }
                });

                if (!menuItem) {
                    throw new Error(`Item ${item.menuItem.name} not found.`);
                }

                if (menuItem.stock < item.quantity) {
                    throw new Error(`Insufficient stock for ${menuItem.name}. Available: ${menuItem.stock}`);
                }

                // Check if this purchase will trigger low stock alert
                if (menuItem.stock - item.quantity <= menuItem.lowStockThreshold) {
                    lowStockAlerts.push({
                        id: menuItem.id,
                        name: menuItem.name,
                        stock: menuItem.stock - item.quantity
                    });
                }
            }

            // 2. Decrement stock for each item
            for (const item of validItems) {
                await tx.menuItem.update({
                    where: { id: item.menuItem.id },
                    data: {
                        stock: { decrement: item.quantity }
                    }
                });
            }

            // 3. Create the order
            const order = await tx.order.create({
                data: {
                    userId: userId,
                    totalAmount: parseFloat(verifiedTotal.toFixed(2)),
                    status: "PENDING",
                    notes: notes || null,
                    paymentId: body.paymentId || null,
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

            return { newOrder: order, lowStockItems: lowStockAlerts };
        });

        // Notify Admin(s) of new order & low stock items
        const admins = await prisma.user.findMany({
            where: { role: 'ADMIN' },
            select: { id: true }
        });

        const notifications = [];

        // Order notification
        for (const admin of admins) {
            notifications.push(prisma.notification.create({
                data: {
                    userId: admin.id,
                    message: `New Order Placed! Total: ₹${verifiedTotal.toFixed(2)}`,
                    type: 'ORDER',
                    link: '/admin/dashboard',
                }
            }));

            // Stock alerts
            for (const item of lowStockItems) {
                notifications.push(prisma.notification.create({
                    data: {
                        userId: admin.id,
                        message: `⚠️ Low Stock Alert: ${item.name} has only ${item.stock} left.`,
                        type: 'STOCK',
                        link: '/admin/menu',
                    }
                }));
            }
        }

        await Promise.all(notifications);

        return NextResponse.json({ success: true, order: newOrder }, { status: 201 });

    } catch (error: any) {
        console.error("Order Creation Error:", error);
        return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
    }
}
