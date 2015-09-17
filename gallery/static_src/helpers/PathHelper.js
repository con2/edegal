import _ from 'lodash';


export function makeBreadcrumb(...albumsOrPictures) {
  var parent = _.first(albumsOrPictures),
      breadcrumb = parent.breadcrumb || [];

  for(let albumOrPicture of albumsOrPictures) {
    breadcrumb.push({
      path: albumOrPicture.path || '',
      title: albumOrPicture.title || ''
    });
  }

  return breadcrumb;
}
