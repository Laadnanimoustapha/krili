import { auth } from "@/auth"

export default auth((req) => {
    if (!req.auth) {
        const newUrl = new URL("/login", req.nextUrl.origin)
        return Response.redirect(newUrl)
    }
})

export const config = {
    matcher: [
        "/profile/:path*",
        "/billing/:path*",
        "/notifications/:path*",
        "/chat/:path*",
        "/my-listings/:path*",
        "/add-listings/:path*",
        "/wishlist/:path*",
    ],
}
