import { publicPhotoCount, randomPublicPhotoPath } from "@/gallery/random";
import { replica } from "@/prisma/reader";

export const dynamic = "force-dynamic";

/** Redirects to a random public photo. */
export async function GET() {
  // Public photos only, for anyone: a replica read regardless of who asks.
  const count = await publicPhotoCount(replica);
  const path = count > 0 ? await randomPublicPhotoPath(replica) : null;
  return new Response(null, {
    status: 307,
    // Relative so the redirect works under whatever public hostname the gateway forwards.
    headers: {
      Location: path ?? "/",
      "Cache-Control": "no-store",
    },
  });
}
