import React from "react";

import { Format } from "../../models/Media";
import replaceFormat from "../../helpers/replaceFormat";
import Link from "next/link";

interface PictureTileProps {
  path: string;
  height: number;
  width: number;
  isPublic: boolean;
  additionalFormats: Format[];
  title?: string;
  showTitle?: boolean;
  src?: string;
  externalLink?: string;
}

interface ThumbnailProps {
  src: string;
  width: number;
  height: number;
  title?: string;
  additionalFormats: Format[];
}

const Thumbnail = ({
  src,
  width,
  height,
  title,
  additionalFormats,
}: ThumbnailProps) => (
  <picture>
    {additionalFormats.map((format) => (
      <source
        key={format}
        srcSet={replaceFormat(src, format)}
        type={`image/${format}`}
      />
    ))}
    <img
      src={src}
      alt={title}
      loading="lazy"
      width={Math.floor(width)}
      height={Math.floor(height)}
    />
  </picture>
);

export default function PictureTile(props: PictureTileProps) {
  const {
    path,
    width,
    height,
    src,
    title,
    additionalFormats,
    externalLink,
    showTitle,
    isPublic,
  } = props;

  // TODO is externalLink still required with Next.js?
  return externalLink ? (
    <a
      className="PictureTile"
      href={externalLink}
      target="_blank"
      rel="noopener noreferrer"
    >
      {src ? (
        <Thumbnail
          src={src}
          width={width}
          height={height}
          title={title}
          additionalFormats={additionalFormats}
        />
      ) : null}
      <div className="PictureTile-title">
        {/* <svg className="PictureTile-icon">
          <use xlinkHref={`${actionIcons}#ic_launch_24px`} />
        </svg> */}
        {title}
      </div>
    </a>
  ) : (
    <Link className="PictureTile" href={path} title={title} prefetch={true}>
      {src ? (
        <Thumbnail
          src={src}
          width={width}
          height={height}
          title={title}
          additionalFormats={additionalFormats}
        />
      ) : null}
      {showTitle && title ? (
        <div className="PictureTile-title">
          {isPublic ? (
            title
          ) : (
            <>
              {/* <svg className="PictureTile-icon">
                <use xlinkHref={`${actionIcons}#ic_lock_open_24px`} />
              </svg> */}
              <em>{title}</em>
            </>
          )}
        </div>
      ) : null}
    </Link>
  );
}
