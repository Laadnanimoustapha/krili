import { auth } from "@/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
    if (!req.auth) {
        return NextResponse.redirect(new URL("/login", req.url))
    }
})

export const config = {
    matcher: [
        "/profile/:path*",
        "/billing/:path*",
        "/notifications/:path*",
        "/messages/:path*",
        "/my-items/:path*",
        "/my-listings/:path*",
        "/list-item/:path*",
        "/list-items/:path*",
        "/wishlist/:path*",
        "/browse/:path*",

    ],
}
