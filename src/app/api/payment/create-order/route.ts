import { NextResponse } from "next/server";
import { auth } from "@/auth";
import Razorpay from "razorpay";

const getRazorpay = () => new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || "",
    key_secret: process.env.RAZORPAY_KEY_SECRET || "",
});

// POST: Create a Razorpay order
export async function POST(req: Request) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { amount } = await req.json();

        if (!amount || amount <= 0) {
            return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
        }

        // Razorpay expects amount in paise (1 INR = 100 paise)
        const options = {
            amount: Math.round(amount * 100),
            currency: "INR",
            receipt: `receipt_${Date.now()}`,
        };

        const razorpay = getRazorpay();
        const razorpayOrder = await razorpay.orders.create(options);

        return NextResponse.json({
            orderId: razorpayOrder.id,
            amount: razorpayOrder.amount,
            currency: razorpayOrder.currency,
        });

    } catch (error) {
        console.error("Razorpay order creation error:", error);
        return NextResponse.json({ error: "Failed to create payment order" }, { status: 500 });
    }
}
