export function baseUrl() {
  if (typeof window !== 'undefined' && window.location) {
    const path = window.location.pathname.replace(/\/[^/]*$/, '');
    return window.location.origin + path;
  }
  return process.env.EXPO_PUBLIC_APP_URL ?? '';
}
export function inviteUrl(token: string) {
  return `${baseUrl()}/?einladung=${encodeURIComponent(token)}`;
}
