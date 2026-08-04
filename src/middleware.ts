import { NextResponse } from 'next/server';

export function middleware() {
    // ==========================================
    // 🛑 OFFLINE SWITCH:
    // To temporarily pause/disable the live site, 
    // UNCOMMENT the return statement below:
    // ==========================================
    
    // return new NextResponse("Website is temporarily offline for maintenance.", { status: 503 });

    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
};
