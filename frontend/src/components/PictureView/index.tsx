import React from 'react';
import { RouteComponentProps, withRouter } from 'react-router';

import editorIcons from 'material-design-icons/sprites/svg-sprite/svg-sprite-editor-symbol.svg';
import navigationIcons from 'material-design-icons/sprites/svg-sprite/svg-sprite-navigation-symbol.svg';

import preloadMedia from '../../helpers/preloadMedia';
import Album from '../../models/Album';
import Picture from '../../models/Picture';
import { T } from '../../translations';
import DownloadDialog from '../DownloadDialog';

import './index.css';
import replaceFormat from '../../helpers/replaceFormat';
import ContactDialog from '../ContactDialog';

type Direction = 'next' | 'previous' | 'album';
const keyMap: { [keyCode: string]: Direction } = {
  Escape: 'album', //
  PageUp: 'previous',
  PageDown: 'next',
  ArrowLeft: 'previous',
  ArrowRight: 'next',
};

type PictureViewProps = RouteComponentProps<{ path: string }> & {
  album: Album;
  picture: Picture;
  fromAlbumView?: boolean;
};

const slideshowMilliseconds = 3000;

function PictureView({ album, picture, fromAlbumView, history }: PictureViewProps): JSX.Element {
  const t = T(r => r.PictureView);
  const { preview, title } = picture;
  const { src } = preview;
  const additionalFormats = preview.additional_formats ?? [];
  const [isDownloadDialogOpen, setDownloadDialogOpen] = React.useState(false);
  const [isContactDialogOpen, setContactDialogOpen] = React.useState(false);

  const goTo = React.useCallback(
    (direction: Direction, state: unknown = undefined) => {
      // TODO hairy due to refactoring .album away from picture, ameliorate
      const destination = direction === 'album' ? album : picture[direction];
      if (destination) {
        if (direction === 'album') {
          if (fromAlbumView) {
            // arrived from album view
            // act as the browser back button
            history.goBack();
          } else {
            // arrived using direct link
            history.push(destination.path, state);
          }
        } else {
          history.replace(destination.path, state);
        }
      }
    },
    [album, picture, fromAlbumView, history]
  );

  const onKeyDown = React.useCallback(
    (event: KeyboardEvent) => {
      if (isDownloadDialogOpen || isContactDialogOpen) {
        return;
      }

      if (event.altKey || event.ctrlKey || event.metaKey) {
        return;
      }

      if (event.key === 'r' || event.key === 'R') {
        history.push('/random');
        return;
      } else if (event.key === 's' || event.key === 'S') {
        startSlideshow();
        return;
      }

      const direction = keyMap[event.code];
      if (direction) {
        goTo(direction);
      }
    },
    [history, goTo, isDownloadDialogOpen, isContactDialogOpen]
  );

  const preloadPreviousAndNext = React.useCallback((picture: Picture) => {
    // use setTimeout to not block rendering of current picture – improves visible latency
    setTimeout(() => {
      if (picture.previous) {
        preloadMedia(picture.previous);
      }

      if (picture.next) {
        preloadMedia(picture.next);
      }
    }, 0);
  }, []);

  const closeDownloadDialog = React.useCallback(() => {
    setTimeout(() => {
      setDownloadDialogOpen(false);
    }, 0);
  }, []);

  const openDownloadDialog = React.useCallback(() => {
    setDownloadDialogOpen(true);
  }, []);

  const contactPhotographer = React.useCallback(() => {
    setTimeout(() => {
      setDownloadDialogOpen(false);
      setContactDialogOpen(true);
    }, 0);
  }, []);

  const closeContactDialog = React.useCallback(() => {
    setContactDialogOpen(false);
  }, []);

  const downloadPicture = React.useCallback(() => {
    window.open(picture.original.src);
  }, [picture]);

  const startSlideshow = React.useCallback(() => {
    setTimeout(() => {
      goTo('next', { slideshow: true });
    }, slideshowMilliseconds);
  }, [goTo]);

  React.useEffect(() => {
    preloadPreviousAndNext(picture);
    document.addEventListener('keydown', onKeyDown);

    if ((history.location.state as any)?.slideshow) {
      startSlideshow();
    }

    return () => {
      document.removeEventListener('keydown', onKeyDown);
    };
  });

  return (
    <div className="PictureView">
      <picture className="PictureView-img">
        {additionalFormats.map(format => (
          <source key={format} srcSet={replaceFormat(src, format)} type={`image/${format}`} />
        ))}
        <img src={src} alt={title} />
      </picture>

      {picture.previous ? (
        <div
          onClick={() => goTo('previous')}
          className="PictureView-nav PictureView-nav-previous"
          title={t(r => r.previousPicture)}
        >
          <svg className="PictureView-icon">
            <use xlinkHref={`${navigationIcons}#ic_chevron_left_24px`} />
          </svg>
        </div>
      ) : null}

      {picture.next ? (
        <div
          onClick={() => goTo('next')}
          className="PictureView-nav PictureView-nav-next"
          title={t(r => r.nextPicture)}
        >
          <svg className="PictureView-icon">
            <use xlinkHref={`${navigationIcons}#ic_chevron_right_24px`} />
          </svg>
        </div>
      ) : null}

      <div
        onClick={() => goTo('album')}
        className="PictureView-action PictureView-action-exit"
        title={t(r => r.backToAlbum)}
      >
        <svg className="PictureView-icon">
          <use xlinkHref={`${navigationIcons}#ic_close_24px`} />
        </svg>
      </div>

      {album.is_downloadable && picture.original && (
        <>
          <div
            onClick={openDownloadDialog}
            className="PictureView-action PictureView-action-download"
            title={t(r => r.downloadOriginal)}
          >
            <svg className="PictureView-icon">
              <use xlinkHref={`${editorIcons}#ic_vertical_align_bottom_24px`} />
            </svg>
          </div>

          <DownloadDialog
            key={picture.path + '/download'}
            t={T(r => r.DownloadDialog)}
            album={album}
            onAccept={downloadPicture}
            onClose={closeDownloadDialog}
            onContactPhotographer={contactPhotographer}
            isOpen={isDownloadDialogOpen}
          />
        </>
      )}
      {album.credits.photographer && (
        <ContactDialog
          key={picture.path + '/contact'}
          isOpen={isContactDialogOpen}
          onClose={closeContactDialog}
          album={album}
          picture={picture}
        />
      )}
    </div>
  );
}

export default withRouter(PictureView);
