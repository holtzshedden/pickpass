// middleware.ts
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedApiRoute = createRouteMatcher([
  "/api/admin(.*)",
  "/api/stores(.*)",
]);

export default clerkMiddleware((auth, req) => {
  if (isProtectedApiRoute(req)) {
    auth.protect();
  }
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
