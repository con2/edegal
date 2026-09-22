import { notFound } from "next/navigation";

/** Browsers request this on their own; without a route it would fall into the gallery catch-all. */
export async function GET() {
  notFound();
}
