import { cache } from "react";

import { auth } from "@/auth";

export type Viewer =
  | { kind: "anonymous" }
  | {
      kind: "user";
      userId: string;
      name: string | null;
      isPhotographer: boolean;
      isAdmin: boolean;
    };

export const anonymous: Viewer = { kind: "anonymous" };

/** Reads the session once per request. */
export const getViewer = cache(async (): Promise<Viewer> => {
  const session = await auth();
  if (!session?.user?.id) return anonymous;
  return {
    kind: "user",
    userId: session.user.id,
    name: session.user.name ?? null,
    isPhotographer: session.user.isPhotographer,
    isAdmin: session.user.isAdmin,
  };
});
