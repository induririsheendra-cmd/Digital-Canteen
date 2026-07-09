import prisma from "@/lib/prisma";
import PlateClient from "./PlateClient";

export const revalidate = 60; // Cache page at the edge for 60 seconds

export default async function YourPlatePage() {
    // Fetch dynamic plate categories and all active items in parallel
    const [categories, allActiveItems] = await Promise.all([
        prisma.plateCategory.findMany({
            orderBy: { createdAt: 'asc' }
        }),
        prisma.menuItem.findMany({
            where: { available: true },
            orderBy: { name: 'asc' }
        })
    ]);

    const relevantCategories = categories.map(cat => cat.name);
    const plateItems = allActiveItems.filter(item => relevantCategories.includes(item.category));

    return <PlateClient items={plateItems} categories={categories} />;
}
