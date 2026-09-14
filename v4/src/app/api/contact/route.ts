import { RateLimiter } from "@/contact/rateLimit";
import { sendContactMessage } from "@/contact/contact";
import { ContactSchema } from "@/contact/schema";
import { getViewer } from "@/gallery/viewer";

const messagesPerWindow = 5;
const windowMs = 10 * 60 * 1000;
const limiter = new RateLimiter(messagesPerWindow, windowMs);

function clientKey(request: Request): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown"
  );
}

/** Relays a visitor's message to the photographers credited for the album or photo in `context`. */
export async function POST(request: Request) {
  if (!limiter.allow(clientKey(request)))
    return Response.json({ error: "tooMany" }, { status: 429 });
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "invalid" }, { status: 400 });
  }
  const input = ContactSchema.safeParse(body);
  if (!input.success)
    return Response.json({ error: "invalid" }, { status: 400 });

  const result = await sendContactMessage(input.data, await getViewer());
  switch (result) {
    case "sent":
      return new Response(null, { status: 204 });
    case "noRecipient":
      return Response.json({ error: "noRecipient" }, { status: 404 });
    case "unavailable":
      return Response.json({ error: "unavailable" }, { status: 503 });
  }
}
