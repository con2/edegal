"use client";

import React from "react";
import Container from "react-bootstrap/Container";
import Link from "next/link";

import preloadMedia from "../../helpers/preloadMedia";
import Album from "../../models/Album";
import Subalbum from "../../models/Subalbum";
import AppBar from "../AppBar";
import AlbumGrid from "./AlbumGrid";
import AlbumViewFooter from "./AlbumViewFooter";
import PhotographerProfile from "./PhotographerProfile";
import Timeline from "./Timeline";
import BreadcrumbBar from "../BreadcrumbBar";

import type { Translations } from "@/translations/en";

import "./index.scss";

interface Year {
  year: string | null;
  subalbums: Subalbum[];
}

function groupAlbumsByYear(subalbums: Subalbum[]): Year[] {
  let currentYear: Year | null = null;
  const years: Year[] = [];

  subalbums.forEach((subalbum) => {
    const year = subalbum.date ? subalbum.date.split("-")[0] : null;

    if (!currentYear || currentYear.year !== year) {
      currentYear = { year, subalbums: [] };
      years.push(currentYear);
    }

    currentYear.subalbums.push(subalbum);
  });

  return years;
}

const defaultWidth = 1200;

const isPhotographerView = (album: Album) =>
  album.path.startsWith("/photographers/");
const isTimelineView = (album: Album) => album.path.endsWith("/timeline");

interface Props {
  album: Album;
  messages: {
    AlbumView: Translations["AlbumView"];
    AlbumViewFooter: Translations["AlbumViewFooter"];
    AppBar: Translations["AppBar"];
    BreadcrumbBar: Translations["BreadcrumbBar"];
    ContactDialog: Translations["ContactDialog"];
    DownloadAlbumDialog: Translations["DownloadAlbumDialog"];
    LarppikuvatProfile: Translations["LarppikuvatProfile"];
  };
}

export default function AlbumView({ album, messages }: Props) {
  const [width, setWidth] = React.useState(
    typeof document !== "undefined"
      ? document.documentElement.clientWidth
      : defaultWidth
  );
  const thisIsPhotographerView = isPhotographerView(album);
  const t = messages.AlbumView;

  const handleResize = React.useCallback(() => {
    setWidth(document.documentElement!.clientWidth);
  }, []);

  React.useEffect(() => {
    const firstPicture = album.pictures[0];

    if (firstPicture) {
      preloadMedia(album, firstPicture.path);
    }

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  });

  let body = null;
  if (thisIsPhotographerView && album.credits.photographer) {
    body = (
      <PhotographerProfile
        photographer={album.credits.photographer}
        coverPicture={album.cover_picture}
        body={album.body}
        messages={messages}
      />
    );
  } else if (album.body) {
    body = (
      <Container
        as="article"
        dangerouslySetInnerHTML={{ __html: album.body || "" }}
      />
    );
  }

  const showBody = body || album.previous_in_series || album.next_in_series;

  // TODO logic is "this is not a nav-linked view", encap somewhere when it grows hairier?
  const showBreadcrumb =
    album.breadcrumb.length && album.path !== "/photographers";

  return (
    <>
      <AppBar album={album} messages={messages.AppBar} />
      {showBreadcrumb ? (
        <BreadcrumbBar album={album} messages={messages} />
      ) : null}

      <main role="main">
        {/* Text body and previous/next links */}
        {showBody ? (
          <div className="TextContent">
            {album.next_in_series || album.previous_in_series ? (
              <div className="container d-flex mb-3">
                {album.next_in_series ? (
                  <Link href={album.next_in_series.path}>
                    &laquo; {album.next_in_series.title}
                  </Link>
                ) : null}
                {album.previous_in_series ? (
                  <Link
                    className="ms-auto"
                    href={album.previous_in_series.path}
                  >
                    {album.previous_in_series.title} &raquo;
                  </Link>
                ) : null}
              </div>
            ) : null}
            {body ? body : null}
          </div>
        ) : null}

        {/* Subalbums */}
        {album.layout === "yearly" ? (
          <div className="YearlyView">
            {groupAlbumsByYear(album.subalbums).map(({ year, subalbums }) => {
              return (
                <div key={year ? year : "unknownYear"}>
                  <h2>{year ? year : t.unknownYear}</h2>
                  <AlbumGrid width={width} tiles={subalbums} showTitle={true} />
                </div>
              );
            })}
          </div>
        ) : (
          <AlbumGrid width={width} tiles={album.subalbums} showTitle={true} />
        )}

        {/* Pictures */}
        <AlbumGrid width={width} tiles={album.pictures} showTitle={false} />
      </main>

      <AlbumViewFooter album={album} messages={messages.AlbumViewFooter} />

      {isTimelineView(album) && <Timeline pictures={album.pictures} />}
    </>
  );
}
