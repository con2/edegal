import React from "react";
import { redirect } from "next/navigation";

import AlbumView from "../../components/AlbumView";
import Loading from "../../components/Loading";
import PictureView from "../../components/PictureView";
import { Content, getAlbum } from "../../helpers/getAlbum";
import ErrorMessage from "../../components/ErrorMessage";
import { T } from "../../translations";
import { getDocumentTitle } from "../../helpers/breadcrumb";

const loadingViewDelayMillis = 500;

export async function MainView({
  params: { path },
}: {
  params: { path: string };
}) {
  const { album, picture } = await getAlbum(path);

  if (album.redirect_url) {
    redirect(album.redirect_url);
    return <></>;
  } else if (picture) {
    return (
      <PictureView
        album={album}
        picture={picture}
      />
    );
  } else {
    return <AlbumView album={album} />;
  }
}

export default MainView;
