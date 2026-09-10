import { legacyEnabled } from "@/config";
import {
  v4PublicPhotoCount,
  v4RandomPublicPhotoPath,
} from "@/gallery/v4/provider";
import {
  legacyPublicPictureCount,
  legacyRandomPublicPicturePath,
} from "@/legacy/sql";

export const dynamic = "force-dynamic";

/** Redirects to a random public photo, choosing the source in proportion to its photo count. */
export async function GET() {
  const [v4Count, legacyCount] = await Promise.all([
    v4PublicPhotoCount(),
    legacyEnabled ? legacyPublicPictureCount() : 0,
  ]);
  const total = v4Count + legacyCount;
  let path: string | null = null;
  if (total > 0) {
    const pickV4 = Math.random() * total < v4Count;
    path = pickV4
      ? await v4RandomPublicPhotoPath()
      : await legacyRandomPublicPicturePath();
  }
  return new Response(null, {
    status: 307,
    // Relative so the redirect works under whatever public hostname the gateway forwards.
    headers: {
      Location: path ?? "/",
      "Cache-Control": "no-store",
    },
  });
}
