import * as React from 'react';
import { connect } from 'react-redux';

import Album from '../../models/Album';
import TileItem from '../../models/TileItem';
import { State } from '../../modules';
import AppBar from '../AppBar';

import './index.css';
import PictureTile from './PictureTile';


const maxWidthFactor = 1.2;
const scaleThresholdFactor = 0.8;
const defaultThumbnailWidth = 240;
const thumbnailHeight = 240;


interface AlbumViewProps {
  album: Album;
  width: number;
}

interface Row {
  height: number;
  totalWidth: number;
  items: TileItem[];
  scaleFactor: number;
}


class AlbumView extends React.PureComponent<AlbumViewProps, {}> {
  render() {
    return (
      <div>
        <AppBar />

        {/* Subalbums */}
        {this.getRows(this.props.album.subalbums).map((row, index) => (
          <div key={index} className="AlbumView-row">
            {row.items.map((item) => (
              <PictureTile
                key={item.path}
                path={item.path}
                height={row.height}
                title={item.title}
                src={item.thumbnail ? item.thumbnail.src : undefined}
              />
            ))}
          </div>
        ))}

        {/* Pictures */}
        {this.getRows(this.props.album.pictures).map((row, index) => (
          <div key={index} className="AlbumView-row">
            {row.items.map((item) => (
              <PictureTile
                key={item.path}
                path={item.path}
                height={row.height}
                src={item.thumbnail ? item.thumbnail.src : undefined}
              />
            ))}
          </div>
        ))}
      </div>
    );
  }

  private getRows(items: TileItem[]): Row[] {
    let currentRow: Row = { height: thumbnailHeight, totalWidth: 0, items: [], scaleFactor: 1.0 };
    const rows: Row[] = [currentRow];
    const maxWidth = maxWidthFactor * this.props.width;

    items.forEach((tileItem) => {
      const itemWidth = tileItem.thumbnail ? tileItem.thumbnail.width : defaultThumbnailWidth;

      if (currentRow.totalWidth + itemWidth > maxWidth) {
        // Initialize new row
        currentRow = { height: thumbnailHeight, totalWidth: 0, items: [], scaleFactor: 1.0 };
        rows.push(currentRow);
      }

      currentRow.items.push(tileItem);
      currentRow.totalWidth += itemWidth;
    });

    // Finalize rows
    const scaleThreshold = this.props.width * scaleThresholdFactor;
    rows.forEach((row) => {
      if (row.totalWidth > scaleThreshold) {
        row.scaleFactor = this.props.width / row.totalWidth;
        row.height = thumbnailHeight * row.scaleFactor;
      }
    });

    return rows;
  }
}


const mapStateToProps = (state: State) => ({
  width: state.mainView.width,
  album: state.album,
});

export default connect<AlbumViewProps>(mapStateToProps)(AlbumView);
