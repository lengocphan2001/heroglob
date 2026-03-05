/**
 * Rewrite imageUrl that points to localhost to use publicUrl.
 * Use on VPS so admin/frontend (different origin) can load images without "Private Network Access" block.
 */
export function rewriteImageUrlToPublic(
  imageUrl: string | null | undefined,
  publicUrl: string,
): string | null | undefined {
  if (!imageUrl?.trim() || !publicUrl?.trim()) return imageUrl;
  try {
    const u = new URL(imageUrl);
    if (u.hostname === 'localhost' || u.hostname === '127.0.0.1') {
      const base = publicUrl.replace(/\/$/, '');
      return base + u.pathname + u.search;
    }
  } catch {
    // ignore invalid URLs
  }
  return imageUrl;
}
