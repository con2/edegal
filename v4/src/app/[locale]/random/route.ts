import {
  v4PublicPhotoCount,
  v4RandomPublicPhotoPath,
} from "@/gallery/v4/provider";

export const dynamic = "force-dynamic";

/** Redirects to a random public photo. */
export async function GET() {
  const count = await v4PublicPhotoCount();
  const path = count > 0 ? await v4RandomPublicPhotoPath() : null;
  return new Response(null, {
    status: 307,
    // Relative so the redirect works under whatever public hostname the gateway forwards.
    headers: {
      Location: path ?? "/",
      "Cache-Control": "no-store",
    },
  });
}
