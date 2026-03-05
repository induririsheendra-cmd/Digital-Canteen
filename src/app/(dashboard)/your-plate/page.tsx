import prisma from "@/lib/prisma";
import PlateClient from "./PlateClient";

export default async function YourPlatePage() {
    // Fetch only items that are relevant to building a plate
    const relevantCategories = ["RICE", "BREAD", "CURRY", "SWEET", "BEVERAGE", "EXTRA"];

    const plateItems = await prisma.menuItem.findMany({
        where: {
            available: true,
            category: { in: relevantCategories }
        },
        orderBy: { name: 'asc' }
    });

    return <PlateClient items={plateItems} />;
}
