import React from "react";
import Link from "next/link";
import Image from "next/image";
import launchIcon from "material-design-icons/action/svg/production/ic_launch_24px.svg";
import lockOpenIcon from "material-design-icons/action/svg/production/ic_lock_open_24px.svg";

import { Format } from "../../models/Media";
import replaceFormat from "../../helpers/replaceFormat";

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

export default function PictureTile({
  path,
  width,
  height,
  src,
  title,
  additionalFormats,
  externalLink,
  showTitle,
  isPublic,
}: React.PropsWithChildren<PictureTileProps>): JSX.Element {
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
        <svg className="PictureTile-icon">
          <use xlinkHref={launchIcon} />
        </svg>
        {title}
      </div>
    </a>
  ) : (
    <Link className="PictureTile" href={path} title={title}>
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
              <Image className="PictureTile-icon" src={lockOpenIcon} alt="Hidden" />
              <em>{title}</em>
            </>
          )}
        </div>
      ) : null}
    </Link>
  );
}
