import NextAuth from "next-auth";
import type { NextAuthRequest } from "next-auth";
import { NextResponse } from "next/server";

const { auth } = NextAuth({ session: { strategy: "jwt" }, providers: [] });

export default auth(function proxy(req: NextAuthRequest) {
  if (!req.auth) {
    return NextResponse.redirect(new URL("/login", req.url));
  }
  return NextResponse.next();
});

export const config = {
  matcher: ["/dashboard/:path*"],
};
