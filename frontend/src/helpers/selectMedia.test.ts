import * as assert from 'assert';

import Picture from '../models/Picture';

import selectMedia from './selectMedia';


const picture: Picture = {
  path: '/foo/bar',
  title: 'Bar',
  media: [
    {
      src: '',
      width: 1600,
      height: 1200,
      quality: 90,
      original: true,
      thumbnail: false,
    },
    {
      src: '',
      width: 1024,
      height: 768,
      quality: 60,
      original: false,
      thumbnail: false,
    },
    {
      src: '',
      width: 800,
      height: 600,
      quality: 60,
      original: false,
      thumbnail: false,
    },
    {
      src: '',
      width: 320,
      height: 240,
      quality: 60,
      original: false,
      thumbnail: true,
    },
  ]
};


describe('selectMedia', () => {
  it('selects the biggest that fits', () => {
    const media = selectMedia(picture, [1280, 960]);
    assert.equal(media.width, 1024);
  });

  it('selects the smallest non-thumbnail when none fit', () => {
    const media = selectMedia(picture, [240, 180]); // minuscule display!
    assert.equal(media.width, 800);
  });
});
