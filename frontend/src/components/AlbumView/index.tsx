import * as React from 'react';
import { connect } from 'react-redux';

import Album from '../../models/Album';
import TileItem from '../../models/TileItem';
import { State } from '../../modules';
import AppBar from '../AppBar';

import preloadMedia from '../../helpers/preloadMedia';
import AlbumGrid from './AlbumGrid';
import './index.css';
import TextContent from './TextContent';
import Subalbum from '../../models/Subalbum';
import { NamespacesConsumer } from 'react-i18next';


interface AlbumViewProps {
  album: Album;
}


interface Year {
  year: string | null;
  subalbums: Subalbum[];
}

function groupAlbumsByYear(subalbums: Subalbum[]): Year[] {
  let currentYear: Year | null = null;
  const years: Year[] = [];

  subalbums.forEach((subalbum) => {
    const year = subalbum.date ? subalbum.date.split('-')[0] : null;

    if (!currentYear || currentYear.year !== year) {
      currentYear = { year, subalbums: [] };
      years.push(currentYear);
    }

    currentYear.subalbums.push(subalbum);
  });

  return years;
}


class AlbumView extends React.PureComponent<AlbumViewProps, {}> {
  render() {
    const { album } = this.props;

    return (
      <NamespacesConsumer ns={['AlbumView']}>
        {(t) => (
          <div>
            <AppBar />

            {album.body ? <TextContent content={album.body} /> : null}

            {/* Subalbums */}
            { album.layout == 'yearly' ? (
              <div className='YearlyView'>
                {groupAlbumsByYear(album.subalbums).map(({ year, subalbums }) => {
                  return (
                    <div>
                      <h2>{year ? year : t('unknownYear')}</h2>
                      <AlbumGrid tiles={subalbums} getTitle={(tile: TileItem) => tile.title} />
                    </div>
                  );
                })}
              </div>
            ) : (
              <AlbumGrid tiles={album.subalbums} getTitle={(tile: TileItem) => tile.title} />
            )}

            {/* Pictures */}
            <AlbumGrid tiles={album.pictures} getTitle={(tile: TileItem) => ""} />
          </div>
        )}
      </NamespacesConsumer>
    );
  }

  preloadFirstPicture() {
    const firstPicture = this.props.album.pictures[0];

    if (firstPicture) {
      preloadMedia(firstPicture);
    }
  }

  componentDidMount() {
    this.preloadFirstPicture();
  }

  componentDidUpdate() {
    this.preloadFirstPicture();
  }
}


const mapStateToProps = (state: State) => ({
  album: state.album,
});

export default connect(mapStateToProps)(AlbumView);
