import Hammer from 'hammerjs';
import ko from 'knockout';
import page from 'page';

import {selectMedia, preloadMedia, getOriginal} from '../helpers/MediaHelper';


export default class PictureViewModel {
  constructor() {
    this.picture = ko.observable(null);
    this.medium = ko.pureComputed(() => {
      return selectMedia(this.picture());
    });
    this.original = ko.pureComputed(() => {
      return getOriginal(this.picture());
    });
    this.original = ko.observable(null);

    this.picture.subscribe(this.preloadPrevNext, this);
  }

  goTo(prevNext) {
    var href = this.picture()[prevNext];
    if (href) {
      page(href);
      return false;
    }
  }

  preloadPrevNext(newPicture) {
    if (newPicture.next) { preloadMedia(newPicture.next); }
    if (newPicture.previous) { preloadMedia(newPicture.previous); }
  }
}
