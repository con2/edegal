import _ from 'lodash';
import Hammer from 'hammerjs';
import ko from 'knockout';
import page from 'page';

import {selectMedia, preloadMedia, getOriginal} from '../helpers/MediaHelper';


const PREV_PICTURE_KEYCODES = [
        37, // left arrow
        33, // page up
      ],
      NEXT_PICTURE_KEYCODES = [
        39, // right arrow
        34, // page down
      ];


export default class PictureViewModel {
  constructor() {
    this.picture = ko.observable(null);
    this.medium = ko.pureComputed(() => {
      return selectMedia(this.picture());
    });
    this.original = ko.pureComputed(() => {
      return getOriginal(this.picture());
    });

    this.picture.subscribe(this.preloadPrevNext, this);

    this.setupKeyBindings();
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

  setupKeyBindings() {
    document.addEventListener('keydown', this.onKeyDown.bind(this), false);
  }

  onKeyDown(event) {
    if (event.altKey || event.ctrlKey || event.metaKey) {
      return true;
    } else if (_.includes(NEXT_PICTURE_KEYCODES, event.keyCode)) {
      this.goTo('next');
    } else if (_.includes(PREV_PICTURE_KEYCODES, event.keyCode)) {
      this.goTo('previous');
    }
  }
}
