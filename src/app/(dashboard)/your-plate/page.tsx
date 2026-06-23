import prisma from "@/lib/prisma";
import PlateClient from "./PlateClient";

export default async function YourPlatePage() {
    // Fetch dynamic plate categories from the database
    const categories = await prisma.plateCategory.findMany({
        orderBy: { createdAt: 'asc' }
    });

    const relevantCategories = categories.map(cat => cat.name);

    const plateItems = await prisma.menuItem.findMany({
        where: {
            available: true,
            category: { in: relevantCategories }
        },
        orderBy: { name: 'asc' }
    });

    return <PlateClient items={plateItems} categories={categories} />;
}
