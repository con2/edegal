import ko from 'knockout';


export default class AlbumViewModel {
  constructor() {
    this.album = ko.observable(null);

    this.album.subscribe((newAlbum) => { console.log('album', newAlbum); })
  }
}
