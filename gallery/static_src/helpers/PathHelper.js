import _ from 'lodash';


// TODO This seems needlessly convoluted.
export function makeBreadcrumb(...albumsOrPictures) {
  var parent = _.first(albumsOrPictures),
      breadcrumb;

  if (parent.breadcrumb) {
    breadcrumb = _.clone(parent.breadcrumb);
  } else {
    breadcrumb = [];
  }

  for(let albumOrPicture of albumsOrPictures) {
    breadcrumb.push({
      path: albumOrPicture.path || '',
      title: albumOrPicture.title || ''
    });
  }

  return breadcrumb;
}
