"use client";

import React from "react";
import Image from "next/image";

import chevronLeftIcon from "material-design-icons/navigation/svg/production/ic_chevron_left_24px.svg";
import chevronRightIcon from "material-design-icons/navigation/svg/production/ic_chevron_right_24px.svg";
import closeIcon from "material-design-icons/navigation/svg/production/ic_close_24px.svg";
import verticalAlignBottomIcon from "material-design-icons/editor/svg/production/ic_vertical_align_bottom_24px.svg";

import preloadMedia from "../../helpers/preloadMedia";
import Album from "../../models/Album";
import Picture from "../../models/Picture";
import { T } from "../../translations";
// import DownloadDialog from "../DownloadDialog";

import "./index.css";
import replaceFormat from "../../helpers/replaceFormat";

type Direction = "next" | "previous" | "album";
const keyMap: { [keyCode: number]: Direction } = {
  27: "album", // escape
  33: "previous", // page up
  34: "next", // page down
  37: "previous", // left arrow
  39: "next", // right arrow
};

type PictureViewProps = {
  album: Album;
  picture: Picture;
  fromAlbumView?: boolean;
};

interface PictureViewState {
  downloadDialogOpen: boolean;
}

class PictureView extends React.Component<PictureViewProps, PictureViewState> {
  state: PictureViewState = { downloadDialogOpen: false };

  render() {
    const t = T((r) => r.PictureView);
    const { album, picture } = this.props;
    const { preview, title } = picture;
    const { src } = preview;
    const additionalFormats = preview.additional_formats ?? [];
    const { downloadDialogOpen } = this.state;

    const previous: Picture | undefined = album.pictures[picture.index - 1];
    const next: Picture | undefined = album.pictures[picture.index + 1];

    return (
      <div className="PictureView">
        <picture className="PictureView-img">
          {additionalFormats.map((format) => (
            <source
              key={format}
              srcSet={replaceFormat(src, format)}
              type={`image/${format}`}
            />
          ))}
          <img src={src} alt={title} />
        </picture>

        {previous ? (
          <div
            onClick={() => this.goTo("previous")}
            className="PictureView-nav PictureView-nav-previous"
            title={t((r) => r.previousPicture)}
          >
            <Image
              className="PictureView-icon"
              src={chevronLeftIcon}
              alt="Previous"
            />
          </div>
        ) : null}

        {next ? (
          <div
            onClick={() => this.goTo("next")}
            className="PictureView-nav PictureView-nav-next"
            title={t((r) => r.nextPicture)}
          >
            <Image
              className="PictureView-icon"
              src={chevronRightIcon}
              alt="Next"
            />
          </div>
        ) : null}

        <div
          onClick={() => this.goTo("album")}
          className="PictureView-action PictureView-action-exit"
          title={t((r) => r.backToAlbum)}
        >
          <Image className="PictureView-icon" src={closeIcon} alt="Close" />
        </div>

        {album.is_downloadable && picture.original ? (
          <div
            onClick={this.openDownloadDialog}
            className="PictureView-action PictureView-action-download"
            title={t((r) => r.downloadOriginal)}
          >
            <Image
              className="PictureView-icon"
              src={verticalAlignBottomIcon}
              alt="Download"
            />
            {/* <DownloadDialog
              key={picture.path}
              t={T((r) => r.DownloadDialog)}
              album={album}
              onAccept={this.downloadPicture}
              onClose={this.closeDownloadDialog}
              isOpen={downloadDialogOpen}
            /> */}
          </div>
        ) : null}
      </div>
    );
  }

  componentDidMount() {
    document.addEventListener("keydown", this.onKeyDown);

    this.preloadPreviousAndNext(this.props.album, this.props.picture);
  }

  componentWillUnmount() {
    document.removeEventListener("keydown", this.onKeyDown);
  }

  componentDidUpdate(prevProps: PictureViewProps) {
    if (this.props.picture.path !== prevProps.picture.path) {
      this.preloadPreviousAndNext(this.props.album, this.props.picture);
    }
  }

  preloadPreviousAndNext(album: Album, picture: Picture) {
    // use setTimeout to not block rendering of current picture – improves visible latency
    const previous: Picture | undefined = album.pictures[picture.index - 1];
    const next: Picture | undefined = album.pictures[picture.index + 1];

    setTimeout(() => {
      if (previous) {
        preloadMedia(previous);
      }

      if (next) {
        preloadMedia(next);
      }
    }, 0);
  }

  onKeyDown = (event: KeyboardEvent) => {
    if (event.altKey || event.ctrlKey || event.metaKey) {
      return;
    }

    // TODO
    // if (event.key === "r" || event.key === "R") {
    //   this.props.history.push("/random");
    //   return;
    // }

    const direction = keyMap[event.keyCode];
    if (direction) {
      this.goTo(direction);
    }
  };

  goTo(direction: Direction) {
    // TODO hairy due to refactoring .album away from picture, ameliorate
    // const { album, picture, fromAlbumView, history } = this.props;
    const { album, picture } = this.props;

    const previous: Picture | undefined = album.pictures[picture.index - 1];
    const next: Picture | undefined = album.pictures[picture.index + 1];

    // const destination = direction === "album" ? album : picture[direction];
    // if (destination) {
      // if (direction === "album") {
      //   if (fromAlbumView) {
      //     // arrived from album view
      //     // act as the browser back button
      //     history.goBack();
      //   } else {
      //     // arrived using direct link
      //     history.push(destination.path);
      //   }
      // } else {
      //   history.replace(destination.path);
      // }
      // redirect(destination.path);
    // }
  }

  // XXX Whytf is setTimeout required here?
  closeDownloadDialog = () => {
    setTimeout(() => this.setState({ downloadDialogOpen: false }), 0);
  };
  openDownloadDialog = () => {
    this.setState({ downloadDialogOpen: true });
  };
  downloadPicture = () => {
    window.open(this.props.picture.original.src);
  };
}

export default PictureView;
