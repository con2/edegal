import React from 'react';
import { Link } from 'react-router-dom';
import actionIcons from 'material-design-icons/sprites/svg-sprite/svg-sprite-action-symbol.svg';

interface PictureTileProps {
  path: string;
  height: number;
  width: number;
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

const Thumbnail = ({ src, width, height, title }: ThumbnailProps) => (
  <img
    src={src}
    alt={title}
    style={{
      display: 'block',
      width: Math.floor(width),
      height: Math.floor(height),
    }}
  />
);

export default class PictureTile extends React.PureComponent<PictureTileProps> {
  render() {
    const { path, width, height, src, title, externalLink, showTitle } = this.props;

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
      <Link className="PictureTile" to={{ pathname: path, state: { fromAlbumView: true } }}>
        {src ? <Thumbnail src={src} width={width} height={height} title={title} /> : null}
        {showTitle && title ? <div className="PictureTile-title">{title}</div> : null}
      </Link>
    );
  }
}
