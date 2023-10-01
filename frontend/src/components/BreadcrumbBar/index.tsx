import React from 'react';
import Link from 'next/link';

import editorIcons from 'material-design-icons/sprites/svg-sprite/svg-sprite-editor-symbol.svg';
import socialIcons from 'material-design-icons/sprites/svg-sprite/svg-sprite-social-symbol.svg';

import { getCached } from '../../helpers/getAlbum';
import Album from '../../models/Album';
import { T } from '../../translations';
// import DownloadDialog, { useDownloadDialogState } from '../DownloadDialog';

import './index.scss';
import { breadcrumbSeparator, getBreadcrumbTitle, getFullBreadcrumb } from '../../helpers/breadcrumb';

const downloadAlbumPollingDelay = 3000;

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function BreadcrumbBar({ album }: { album: Album }): JSX.Element {
  const t = React.useMemo(() => T(r => r.BreadcrumbBar), []);
  const fullBreadcrumb = React.useMemo(() => getFullBreadcrumb(album, undefined, 1), [album]);
  const canDownload = album.is_downloadable && album.pictures.length;
  const isPhotographerLinkShown =
    album.credits.photographer && album.credits.photographer.path !== album.path;

  const [isDownloadPreparing, setDownloadPreparing] = React.useState(false);
  // const { isDownloadDialogOpen, openDownloadDialog, closeDownloadDialog } = useDownloadDialogState();

  const downloadAlbum = React.useCallback(async () => {
    let downloadableAlbum = album;
    if (!album.download_url) {
      // Zip not yet created
      setDownloadPreparing(true);

      // Trigger zip creation
      downloadableAlbum = await getCached(album.path, true, true);

      // Poll for zip creation to finish
      while (!downloadableAlbum.download_url) {
        await sleep(downloadAlbumPollingDelay);
        downloadableAlbum = await getCached(album.path, true);
      }
    }

    setDownloadPreparing(false);
    window.location.href = downloadableAlbum.download_url;
  }, [album]);

  return (
    <div className="container container-fluid BreadcrumbBar d-flex flex-column flex-sm-row justify-content-between">
      <nav className="BreadcrumbBar-breadcrumb">
        {fullBreadcrumb.map((item, index) => {
          const isActive = index === fullBreadcrumb.length - 1;
          const content = getBreadcrumbTitle(item, t);
          const separator = index > 0 ? breadcrumbSeparator : '';
          if (isActive) {
            return (
              <React.Fragment key={item.path}>
                {separator} {content}
              </React.Fragment>
            );
          } else {
            return (
              <React.Fragment key={item.path}>
                {separator}
                <Link key={item.path} href={item.path}>
                  {content}
                </Link>
              </React.Fragment>
            );
          }
        })}
      </nav>
      <nav className="BreadcrumbBar-actions">
        {/* TODO {canDownload ? (
          <Button variant="link" size="sm" onClick={openDownloadDialog}>
            <svg className="BreadcrumbBar-icon">
              <use xlinkHref={`${editorIcons}#ic_vertical_align_bottom_24px`} />
            </svg>
            {t(r => r.downloadAlbumLink)}…
          </Button>
        ) : null}
        FIXME why does this need `as any`? it works */}
        {isPhotographerLinkShown ? (
          <Link className="btn btn-link btn-sm" href={album.credits.photographer!.path}>
            <svg className="BreadcrumbBar-icon">
              <use xlinkHref={`${socialIcons}#ic_person_24px`} />
            </svg>
            {t(r => r.aboutPhotographerLink)}
          </Link>
        ) : null}
      </nav>

      {/* <DownloadDialog
        key={album.path}
        album={album}
        onAccept={downloadAlbum}
        onClose={closeDownloadDialog}
        isOpen={isDownloadDialogOpen}
        isPreparing={isDownloadPreparing}
        t={T(r => r.DownloadAlbumDialog)}
      /> */}
    </div>
  );
}

export default BreadcrumbBar;
