import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const path = request.nextUrl.pathname;
  const isOpen = path === "/admin" || path === "/admin/reset";

  if (!url || !anon) {
    if (path.startsWith("/admin") && !isOpen) return NextResponse.redirect(new URL("/admin", request.url));
    return response;
  }

  const supabase = createServerClient(url, anon, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (list) => {
        list.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        list.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  const { data } = await supabase.auth.getUser();

  if (path.startsWith("/admin") && !isOpen && !data.user) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }
  if (path === "/admin" && data.user) {
    return NextResponse.redirect(new URL("/admin/dashboard", request.url));
  }
  return response;
}

export const config = {
  matcher: ["/admin/:path*"],
};
