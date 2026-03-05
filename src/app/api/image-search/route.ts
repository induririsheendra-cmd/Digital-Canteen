import { NextResponse } from "next/server";
import { auth } from "@/auth";

export async function GET(req: Request) {
    try {
        const session = await auth();
        const userWithRole = session?.user as any;
        if (userWithRole?.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const query = searchParams.get("q");
        if (!query) {
            return NextResponse.json({ error: "Missing query parameter 'q'" }, { status: 400 });
        }

        const apiKey = process.env.PEXELS_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ error: "PEXELS_API_KEY not configured in .env" }, { status: 500 });
        }

        const res = await fetch(
            `https://api.pexels.com/v1/search?query=${encodeURIComponent(query + " food")}&per_page=8&orientation=landscape`,
            {
                headers: { Authorization: apiKey },
            }
        );

        if (!res.ok) {
            return NextResponse.json({ error: "Pexels API error" }, { status: res.status });
        }

        const data = await res.json();

        const images = (data.photos || []).map((photo: any) => ({
            url: photo.src.medium, // 350px wide, fast loading
            urlFull: photo.src.large2x, // Full quality for saving
            title: photo.alt || query,
            photographer: photo.photographer,
        }));

        return NextResponse.json({ images });
    } catch (error) {
        console.error("Image search error:", error);
        return NextResponse.json({ error: "Failed to search images" }, { status: 500 });
    }
}
