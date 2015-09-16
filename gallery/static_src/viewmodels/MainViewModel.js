import ko from 'knockout';
import page from 'page';

import AlbumViewModel from './AlbumViewModel';
import PictureViewModel from './PictureViewModel';
import pkg from '../../../package.json';
import {getContent} from '../services/AlbumService';


export default class MainViewModel {
  constructor() {
    this.albumViewModel = new AlbumViewModel();
    this.PictureViewModel = new PictureViewModel();

    this.breadcrumb = ko.observable(null);
    this.activeView = ko.observable(null);

    this.copyrightFooter = this.i("Edegal copyright footer").replace('VERSION', pkg.version);

    page(/^([\/a-zA-Z0-9-\/]*)$/, (ctx, next) => {
      albumService.getContent(ctx.params[0]).then(({album, picture}) => {
        this.breadcrumb(pathHelper.makeBreadcrumb(album));

        if (picture) {
          this.pictureViewModel.setPicture(picture);
          this.activeView('picture');
        } else {
          this.albumViewModel.setAlbum(album);
          this.activeView('album');
        }

        if (album.path === '/') {
          document.title = album.title;
        } else {
          document.title = `${album.title} – ${album.breadcrumb[0].title}`;
        }
      });
    });
  }
}
