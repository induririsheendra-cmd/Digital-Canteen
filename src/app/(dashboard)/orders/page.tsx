import styles from "./orders.module.css";
import Link from "next/link";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import OrderHistoryList from "./components/OrderHistoryList";
import { redirect } from "next/navigation";

export default async function OrdersPage({
    searchParams,
}: {
    searchParams: Promise<{ success?: string }>;
}) {
    const params = await searchParams;
    const session = await auth();

    if (!session?.user?.id) {
        redirect("/?login=true");
    }

    const showSuccess = params.success === "true";

    // Fetch user's orders
    const orders = await prisma.order.findMany({
        where: { userId: session.user.id },
        include: {
            orderItems: {
                include: { menuItem: true }
            }
        },
        orderBy: { createdAt: 'desc' },
    });

    return (
        <div className={styles.container}>
            {showSuccess && (
                <div className={`${styles.successCard} animate-fade-in`}>
                    <div className={styles.iconContainer}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                            <path d="M22 4L12 14.01l-3-3" />
                        </svg>
                    </div>
                    <h1 className="text-gradient">Order Placed Successfully!</h1>
                    <p className={styles.message}>
                        Your digital canteen order has been processed. Track its progress below!
                    </p>

                    <div className={styles.actions}>
                        <Link href="/menu" className="glass-button">
                            Order More
                        </Link>
                        <Link href="/home" className={`glass-button ${styles.secondaryBtn}`}>
                            Back to Home
                        </Link>
                    </div>
                </div>
            )}

            <OrderHistoryList orders={orders} />
        </div>
    );
}
