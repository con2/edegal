import React from 'react';
import { Link } from 'react-router-dom';
import actionIcons from 'material-design-icons/sprites/svg-sprite/svg-sprite-action-symbol.svg';

interface PictureTileProps {
  path: string;
  height: number;
  width: number;
  isPublic: boolean;
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
}

const nonPublicSuffix = ' 🔐';

const Thumbnail = ({ src, width, height, title }: ThumbnailProps) => (
  <img
    src={src}
    alt={title}
    style={{
      display: 'block',
      width: Math.floor(width),
      height: Math.floor(height),
    }}
    loading="lazy"
  />
);

export default class PictureTile extends React.PureComponent<PictureTileProps> {
  render() {
    const { path, width, height, src, title, externalLink, showTitle, isPublic } = this.props;

    return externalLink ? (
      <a className="PictureTile" href={externalLink} target="_blank" rel="noopener noreferrer">
        {src ? <Thumbnail src={src} width={width} height={height} title={title} /> : null}
        <div className="PictureTile-title">
          {title}
          <svg className="PictureTile-icon">
            <use xlinkHref={`${actionIcons}#ic_launch_24px`} />
          </svg>
        </div>
      </a>
    ) : (
      <Link className="PictureTile" to={{ pathname: path, state: { fromAlbumView: true } }} title={title}>
        {src ? <Thumbnail src={src} width={width} height={height} title={title} /> : null}
        {showTitle && title ? (
          <div className="PictureTile-title">
            {isPublic ? (
              title
            ) : (
              <>
                <em>{title}</em>
                <svg className="PictureTile-icon">
                  <use xlinkHref={`${actionIcons}#ic_lock_open_24px`} />
                </svg>
              </>
            )}
          </div>
        ) : null}
      </Link>
    );
  }
}
