import prisma from "@/lib/prisma";
import AdminMenuClient from "./AdminMenuClient";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function AdminMenuPage() {
    const session = await auth();

    const userWithRole = session?.user as any;
    if (userWithRole?.role !== "ADMIN") {
        redirect("/home");
    }

    const allItems = await prisma.menuItem.findMany({
        orderBy: {
            category: 'asc'
        }
    });

    return <AdminMenuClient initialItems={allItems} />;
}
