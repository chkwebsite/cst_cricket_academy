import { NextResponse } from "next/server";

const PUBLIC_FILE = /\.(.*)$/;
const AUTH_PATHS = ["/next_panel"];

export function middleware(request) {
    const { pathname } = request.nextUrl;

    if (pathname.startsWith("/_next") || pathname.startsWith("/api") || pathname.startsWith("/static") || PUBLIC_FILE.test(pathname)) {
        return NextResponse.next();
    }

    if (AUTH_PATHS.some((path) => pathname === path || pathname.startsWith(path + "/"))) {
        const token = request.cookies.get("token")?.value;
        if (!token) {
            const url = request.nextUrl.clone();
            url.pathname = "/login";
            return NextResponse.redirect(url);
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/next_panel/:path*"],
};
