import React from "react";
import { redirect } from "next/navigation";

import AlbumView from "../../components/AlbumView";
import PictureView from "../../components/PictureView";
import { getAlbum } from "../../helpers/getAlbum";
import { getDocumentTitle, getFullBreadcrumb } from "@/helpers/breadcrumb";

export const revalidate = 300;

interface Params {
  path?: string[];
}

function expandPath(path?: string[]) {
  return "/" + (path?.join("/") ?? "");
}

export async function generateMetadata({
  params: { path },
}: {
  params: Params;
}) {
  const { album, picture } = await getAlbum(expandPath(path));
  const fullBreadcrumb = getFullBreadcrumb(album, picture);
  // XXX bogus translation function
  const title = getDocumentTitle((r: unknown) => "", album, picture);
  return {
    // TODO include breadcrumb
    title,
  };
}

export async function MainView({ params: { path } }: { params: Params }) {
  const { album, picture } = await getAlbum(expandPath(path));

  if (album.redirect_url) {
    redirect(album.redirect_url);
  } else if (picture) {
    return <PictureView album={album} picture={picture} />;
  } else {
    return <AlbumView album={album} />;
  }
}

export default MainView;
