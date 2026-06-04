import { auth } from "@/auth";
import { redirect } from "next/navigation";
import AnalyticsClient from "./AnalyticsClient";

export default async function AdminAnalyticsPage() {
    const session = await auth();

    const userWithRole = session?.user as any;
    if (userWithRole?.role !== "ADMIN") {
        redirect("/home");
    }

    return <AnalyticsClient />;
}
