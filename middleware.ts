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

  // Protected admin pages: only check that a login cookie exists (NO network call to Supabase).
  // This was a full round-trip on every admin click. The panel layout still verifies the user
  // and admin rights with Supabase on the server, so this is only a fast first gate.
  if (path.startsWith("/admin") && !isOpen) {
    const { data } = await supabase.auth.getSession();
    if (!data.session) return NextResponse.redirect(new URL("/admin", request.url));
    return response;
  }

  // Login page: stay strict (verified with Supabase) so a stale cookie can never cause a redirect loop.
  if (path === "/admin") {
    const { data } = await supabase.auth.getUser();
    if (data.user) return NextResponse.redirect(new URL("/admin/dashboard", request.url));
  }
  return response;
}

export const config = {
  matcher: ["/admin/:path*"],
};
