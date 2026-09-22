import { mediaBaseUrl } from "@/config";

/** Storage keys are paths relative to the media root, e.g. `previews/album/pic.preview.avif`. */
export function mediaUrl(storageKey: string): string {
  return `${mediaBaseUrl}/${storageKey.replace(/^\/+/, "")}`;
}
