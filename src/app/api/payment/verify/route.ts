import { NextResponse } from "next/server";
import { auth } from "@/auth";
import crypto from "crypto";

// POST: Verify Razorpay payment signature
export async function POST(req: Request) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await req.json();

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return NextResponse.json({ error: "Missing payment details" }, { status: 400 });
        }

        // Verify signature
        const body = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "")
            .update(body)
            .digest("hex");

        const isAuthentic = expectedSignature === razorpay_signature;

        if (!isAuthentic) {
            return NextResponse.json({ error: "Payment verification failed" }, { status: 400 });
        }

        return NextResponse.json({
            verified: true,
            paymentId: razorpay_payment_id,
        });

    } catch (error) {
        console.error("Payment verification error:", error);
        return NextResponse.json({ error: "Payment verification failed" }, { status: 500 });
    }
}
