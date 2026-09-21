/** Runs once per server start, before requests are served. */
export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  const { ensureRootAlbum } = await import("@/gallery/root");
  try {
    await ensureRootAlbum();
  } catch (error) {
    // A missing root only disables album creation; the site must still come up if the
    // database is briefly unavailable at startup.
    console.error("ensureRootAlbum failed:", error);
  }
}
