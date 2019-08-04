import * as React from 'react';

import TileItem from '../../models/TileItem';
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


interface AlbumGridProps {
  width: number;
  tiles: TileItem[];
  showTitle: boolean;
}


const AlbumGrid: React.FC<AlbumGridProps> = ({ tiles, showTitle, width }) => {
  const rows: Row[] = [];

  if (tiles.length) {
    let currentRow: Row = makeRow();
    const maxWidth = maxWidthFactor * width;
    rows.push(currentRow);

    tiles.forEach((tileItem) => {
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
    const scaleThreshold = width * scaleThresholdFactor;
    rows.forEach((row) => {
      if (row.totalWidth > scaleThreshold) {
        row.scaleFactor = width / row.totalWidth;
        row.height = thumbnailHeight * row.scaleFactor;
      }
    });
  }

  return (
    <div>
      {rows.map((row, index) => (
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

export default AlbumGrid;
