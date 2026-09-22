import { publicPhotoCount, randomPublicPhotoPath } from "@/gallery/random";

export const dynamic = "force-dynamic";

/** Redirects to a random public photo. */
export async function GET() {
  const count = await publicPhotoCount();
  const path = count > 0 ? await randomPublicPhotoPath() : null;
  return new Response(null, {
    status: 307,
    // Relative so the redirect works under whatever public hostname the gateway forwards.
    headers: {
      Location: path ?? "/",
      "Cache-Control": "no-store",
    },
  });
}
