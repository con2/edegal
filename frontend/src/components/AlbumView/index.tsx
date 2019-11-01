import React from 'react';
import { Link } from 'react-router-dom';

import { getCached } from '../../helpers/getAlbum';
import preloadMedia from '../../helpers/preloadMedia';
import Album from '../../models/Album';
import Subalbum from '../../models/Subalbum';
import AppBar from '../AppBar';
import DownloadDialog from '../DownloadDialog';
import AlbumGrid from './AlbumGrid';

import './index.css';
import AlbumViewFooter from './AlbumViewFooter';
import { T } from '../../translations';
import PhotographerProfile from './PhotographerProfile';

interface AlbumViewProps {
  album: Album;
}

interface AlbumViewState {
  downloadDialogOpen: boolean;
  downloadDialogPreparing: boolean;
  width: number;
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

  subalbums.forEach(subalbum => {
    const year = subalbum.date ? subalbum.date.split('-')[0] : null;

    if (!currentYear || currentYear.year !== year) {
      currentYear = { year, subalbums: [] };
      years.push(currentYear);
    }

    currentYear.subalbums.push(subalbum);
  });

  return years;
}

function isPhotographerView(album: Album) {
  return album.path.startsWith('/photographers/');
}

export default class AlbumView extends React.Component<AlbumViewProps, AlbumViewState> {
  state: AlbumViewState = {
    downloadDialogOpen: false,
    downloadDialogPreparing: false,
    width: document.documentElement ? document.documentElement.clientWidth : 0,
  };

  render() {
    const { album } = this.props;
    const { downloadDialogOpen, downloadDialogPreparing, width } = this.state;
    const canDownload = album.is_downloadable && album.pictures.length;
    const t = T(r => r.AlbumView);

    let body = null;
    if (isPhotographerView(album) && album.credits.photographer) {
      body = <PhotographerProfile photographer={album.credits.photographer} coverPicture={album.cover_picture} body={album.body} />;
    } else if (album.body) {
      body = <article className="container" dangerouslySetInnerHTML={{ __html: album.body || '' }} />;
    }

    const showBody = body || album.previous_in_series || album.next_in_series;

    return (
      <>
        <AppBar
          album={album}
          actions={
            canDownload
              ? [
                  {
                    label: t(r => r.downloadAlbumLink) + '…',
                    onClick: this.openDownloadDialog,
                  },
                ]
              : []
          }
        />

        <main role="main">
          {/* Text body and previous/next links */}
          {showBody ? (
            <div className="TextContent">
              {album.next_in_series || album.previous_in_series ? (
                <div className="container d-flex mb-3">
                  {album.next_in_series ? <Link to={album.next_in_series.path}>&laquo; {album.next_in_series.title}</Link> : null}
                  {album.previous_in_series ? (
                    <Link className="ml-auto" to={album.previous_in_series.path}>
                      {album.previous_in_series.title} &raquo;
                    </Link>
                  ) : null}
                </div>
              ) : null}
              {body ? body : null}
            </div>
          ) : null}

          {/* Subalbums */}
          {album.layout === 'yearly' ? (
            <div className="YearlyView">
              {groupAlbumsByYear(album.subalbums).map(({ year, subalbums }) => {
                return (
                  <div key={year ? year : 'unknownYear'}>
                    <h2>{year ? year : t(r => r.unknownYear)}</h2>
                    <AlbumGrid width={width} tiles={subalbums} showTitle={true} />
                  </div>
                );
              })}
            </div>
          ) : (
            <AlbumGrid width={width} tiles={album.subalbums} showTitle={true} />
          )}

          {/* Pictures */}
          <AlbumGrid width={width} tiles={album.pictures} showTitle={false} />
        </main>

        <AlbumViewFooter album={album} />

        {/* Download dialog */}
        {downloadDialogOpen ? (
          <DownloadDialog
            album={album}
            onAccept={this.downloadAlbum}
            onClose={this.closeDownloadDialog}
            preparing={downloadDialogPreparing}
            t={T(r => r.DownloadAlbumDialog)}
          />
        ) : null}
      </>
    );
  }

  componentDidMount() {
    this.preloadFirstPicture();

    window.addEventListener('resize', this.handleResize);
    this.handleResize();
  }

  componentDidUpdate() {
    this.preloadFirstPicture();
  }

  handleResize = () => {
    this.setState({ width: document.documentElement!.clientWidth });
  };

  preloadFirstPicture() {
    const firstPicture = this.props.album.pictures[0];

    if (firstPicture) {
      preloadMedia(firstPicture);
    }
  }

  // XXX Whytf is setTimeout required here?
  closeDownloadDialog = () => {
    setTimeout(() => this.setState({ downloadDialogOpen: false }), 0);
  };
  openDownloadDialog = () => {
    this.setState({ downloadDialogOpen: true });
  };

  downloadAlbum = async () => {
    let { album } = this.props;

    if (!album.download_url) {
      this.setState({ downloadDialogPreparing: true });

      // Trigger zip creation
      album = await getCached(album.path, 'jpeg', true, true);

      // Poll for zip creation to finish
      while (!album.download_url) {
        await sleep(downloadAlbumPollingDelay);
        album = await getCached(album.path, 'jpeg', true);
      }
    }

    this.setState({ downloadDialogPreparing: false });

    window.location.href = album.download_url;
  };
}
