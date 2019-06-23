import * as React from 'react';
import { connect } from 'react-redux';

import TileItem from '../../models/TileItem';
import { State } from '../../modules';
import PictureTile from './PictureTile';


const maxWidthFactor = 1.1;
const scaleThresholdFactor = 0.8;
const defaultThumbnailWidth = 240;
const thumbnailHeight = 240;
const borderAdjustmentPixels = 2;


interface Row {
  height: number;
  totalWidth: number;
  items: TileItem[];
  scaleFactor: number;
}


const makeRow: () => Row = () => ({ height: thumbnailHeight, totalWidth: 0, items: [], scaleFactor: 1.0 });


interface AlbumGridStateProps {
  width: number;
}
interface AlbumGridOwnProps {
  tiles: TileItem[];
  showTitle: boolean;
}
type AlbumGridProps = AlbumGridStateProps & AlbumGridOwnProps;

class AlbumGrid extends React.PureComponent<AlbumGridProps, {}> {
  render() {
    const { tiles, showTitle } = this.props;

    return (
      <div>
        {this.getRows(tiles).map((row, index) => (
          <div key={index} className="AlbumView-row" style={{ height: Math.floor(row.height) + borderAdjustmentPixels }}>
            {row.items.map((item) => (
              <PictureTile
                key={item.path}
                path={item.path}
                width={item.thumbnail ? item.thumbnail.width * row.scaleFactor : defaultThumbnailWidth * row.scaleFactor}
                height={row.height}
                title={item.title}
                showTitle={showTitle}
                src={item.thumbnail ? item.thumbnail.src : undefined}
                externalLink={item.redirect_url}
              />
            ))}
          </div>
        ))}
      </div>
    );
  }

  private getRows(items: TileItem[]): Row[] {
    if (items.length < 1) {
      return [];
    }

    let currentRow: Row = makeRow();
    const rows: Row[] = [currentRow];
    const maxWidth = maxWidthFactor * this.props.width;

    items.forEach((tileItem) => {
      const itemWidth = tileItem.thumbnail ? tileItem.thumbnail.width : defaultThumbnailWidth;

      if (currentRow.totalWidth + itemWidth > maxWidth) {
        // Initialize new row
        currentRow = makeRow();
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
});

export default connect(mapStateToProps)(AlbumGrid);
