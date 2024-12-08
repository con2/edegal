import type Album from "@/models/Album";
import replaceFormat from "./replaceFormat";

/**
 * Preloads the picture preview for the given image for SPEED.
 *
 * Does this by creating a <picture><source><img></picture> element
 * that has srcset/src set but is not attached to the DOM.
 *
 * @param picture The picture to preload the preview media for.
 */
export default function preloadMedia(album: Album, path: string) {
  const picture = album.pictures.find((picture) => picture.path === path);
  if (!picture) {
    return;
  }

  const { src } = picture.preview;
  const additionalFormats = picture.preview.additional_formats ?? [];

  const pictureElement = document.createElement("picture");

  for (const format of additionalFormats) {
    const sourceElement = document.createElement("source");
    pictureElement.appendChild(sourceElement);
    sourceElement.type = `image/${format}`;
    sourceElement.srcset = replaceFormat(src, format);
  }

  const imgElement = document.createElement("img");
  pictureElement.appendChild(imgElement);
  imgElement.src = picture.preview.src;
}
