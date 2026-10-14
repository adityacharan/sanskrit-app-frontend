// Dummy session: a cookie that says "logged in". No credentials, no backend.
// A cookie (not localStorage) so proxy.ts can redirect on the server before render.

export const SESSION_COOKIE = "sanskrit_session";
const ONE_YEAR = 60 * 60 * 24 * 365;

export function logIn() {
  document.cookie = `${SESSION_COOKIE}=1; Path=/; Max-Age=${ONE_YEAR}; SameSite=Lax`;
}

export function logOut() {
  document.cookie = `${SESSION_COOKIE}=; Path=/; Max-Age=0; SameSite=Lax`;
}

// Only allow same-site paths as a post-login destination.
export function safeNext(next: string | null): string {
  return next && next.startsWith("/") && !next.startsWith("//") && !next.startsWith("/login") ? next : "/";
}
