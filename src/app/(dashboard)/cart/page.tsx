import prisma from "@/lib/prisma";
import CartClient from "./CartClient";

export default async function CartPage() {
    const mealTimings = await prisma.mealTiming.findMany();
    return <CartClient mealTimings={mealTimings} />;
}
