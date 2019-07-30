import * as React from 'react';
import { connect } from 'react-redux';

import Album from '../../models/Album';
import { State } from '../../modules';
import AppBar from '../AppBar';

import preloadMedia from '../../helpers/preloadMedia';
import AlbumGrid from './AlbumGrid';
import './index.css';
import Subalbum from '../../models/Subalbum';
import { Translation } from 'react-i18next';
import { Link } from 'react-router-dom';
import DownloadDialog from '../DownloadDialog';
import { getCached } from '../../modules/album';


interface AlbumViewProps {
  album: Album;
}

interface AlbumViewState {
  downloadDialogOpen: boolean;
  downloadDialogPreparing: boolean;
}


interface Year {
  year: string | null;
  subalbums: Subalbum[];
}


const downloadAlbumPollingDelay = 3000;

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
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


class AlbumView extends React.PureComponent<AlbumViewProps, AlbumViewState> {
  state = {
    downloadDialogOpen: false,
    downloadDialogPreparing: false,
  }

  render() {
    const { album } = this.props;
    const { downloadDialogOpen, downloadDialogPreparing } = this.state;
    const canDownload = album.is_downloadable && album.pictures.length;

    const showBody = album.body || album.previous_in_series || album.next_in_series;

    return (
      <Translation ns={['AlbumView']}>
        {(t) => (
          <div>
            <AppBar actions={canDownload ? [
              {
                label: t('downloadAlbumLink') + '…',
                onClick: this.openDownloadDialog,
              },
            ] : []} />

            {/* Text body and previous/next links */}
            {showBody ? (
              <div className="TextContent">
                {album.next_in_series || album.previous_in_series ? (
                  <div className="container d-flex mb-3">
                    {album.next_in_series ? <Link to={album.next_in_series.path}>&laquo; {album.next_in_series.title}</Link> : null}
                    {album.previous_in_series ? <Link className='ml-auto' to={album.previous_in_series.path}>{album.previous_in_series.title} &raquo;</Link> : null}
                  </div>
                ) : null}
                <article className="container" dangerouslySetInnerHTML={{ __html: album.body || '' }} />
              </div>
            ) : null}

            {/* Subalbums */}
            { album.layout === 'yearly' ? (
              <div className='YearlyView'>
                {groupAlbumsByYear(album.subalbums).map(({ year, subalbums }) => {
                  return (
                    <div key={year ? year : 'unknownYear'}>
                      <h2>{year ? year : t('unknownYear')}</h2>
                      <AlbumGrid tiles={subalbums} showTitle={true} />
                    </div>
                  );
                })}
              </div>
            ) : (
              <AlbumGrid tiles={album.subalbums} showTitle={true} />
            )}

            {/* Pictures */}
            <AlbumGrid tiles={album.pictures} showTitle={false} />

            {/* Download dialog */}
            {downloadDialogOpen ? (
              <DownloadDialog
                ns="DownloadAlbumDialog"
                album={album}
                onAccept={this.downloadAlbum}
                onClose={this.closeDownloadDialog}
                preparing={downloadDialogPreparing}
              />
            ) : null}
          </div>
        )}
      </Translation>
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

  // XXX Whytf is setTimeout required here?
  closeDownloadDialog = () => { setTimeout(() => this.setState({ downloadDialogOpen: false }), 0); }
  openDownloadDialog = () => { this.setState({ downloadDialogOpen: true }); }

  downloadAlbum = async () => {
    let { album } = this.props;

    if (!album.download_url) {
      this.setState({ downloadDialogPreparing: true });

      // Trigger zip creation
      album = await getCached(album.path, 'jpeg', true, true)

      // Poll for zip creation to finish
      while (!album.download_url) {
        await sleep(downloadAlbumPollingDelay);
        album = await getCached(album.path, 'jpeg', true);
      }
    }

    this.setState({ downloadDialogPreparing: false });

    window.open(album.download_url);
  }
}


const mapStateToProps = (state: State) => ({
  album: state.album,
});

export default connect(mapStateToProps)(AlbumView);
