import React from 'react';
import { Link } from 'react-router-dom';
import actionIcons from 'material-design-icons/sprites/svg-sprite/svg-sprite-action-symbol.svg';

import { Format } from '../../models/Media';
import replaceFormat from '../../helpers/replaceFormat';

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

const Thumbnail = ({ src, width, height, title, additionalFormats }: ThumbnailProps) => (
  <picture
    style={{
      display: 'block',
      width: Math.floor(width),
      height: Math.floor(height),
    }}
  >
    {additionalFormats.map(format => (
      <source key={format} srcSet={replaceFormat(src, format)} type={`image/${format}`} />
    ))}
    <img src={src} alt={title} loading="lazy" />
  </picture>
);

export default class PictureTile extends React.PureComponent<PictureTileProps> {
  render() {
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
    } = this.props;

    return externalLink ? (
      <a className="PictureTile" href={externalLink} target="_blank" rel="noopener noreferrer">
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
            <use xlinkHref={`${actionIcons}#ic_launch_24px`} />
          </svg>
          {title}
        </div>
      </a>
    ) : (
      <Link className="PictureTile" to={{ pathname: path, state: { fromAlbumView: true } }} title={title}>
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
                <svg className="PictureTile-icon">
                  <use xlinkHref={`${actionIcons}#ic_lock_open_24px`} />
                </svg>
                <em>{title}</em>
              </>
            )}
          </div>
        ) : null}
      </Link>
    );
  }
}
