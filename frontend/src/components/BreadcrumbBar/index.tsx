import React from 'react';

import Container from 'react-bootstrap/Container';
import { Link } from 'react-router-dom';

import Album from '../../models/Album';
import Breadcrumb from '../../models/Breadcrumb';
import { T, TranslationFunction } from '../../translations';

import './index.scss';

const breadcrumbSeparator = ' » ';

function getBreadcrumbTitle(breadcrumb: Breadcrumb, t: TranslationFunction<{ photographers: string; timeline: string }>) {
  if (breadcrumb.path === '/photographers') {
    return t(r => r.photographers);
  } else if (breadcrumb.path.endsWith('/timeline')) {
    return t(r => r.timeline);
  } else {
    return breadcrumb.title;
  }
}

export function BreadcrumbBar({ album }: { album: Album }): JSX.Element {
  const t = T(r => r.BreadcrumbBar);
  const { path, title, breadcrumb } = album;
  const fullBreadcrumb = React.useMemo(() => breadcrumb.slice(1).concat([{ path, title }]), [breadcrumb, path, title]);

  React.useEffect(() => {
    document.title = fullBreadcrumb.map(crumb => getBreadcrumbTitle(crumb, t)).join(breadcrumbSeparator);
  }, [fullBreadcrumb]);

  return (
    <div className="BreadcrumbBar">
      <Container className="d-flex flex-row justify-content-between">
        <nav>
          {fullBreadcrumb.map((item, index) => {
            const isActive = index === fullBreadcrumb.length - 1;
            if (isActive) {
              return (
                <span key={item.path}>
                  {breadcrumbSeparator}
                  {getBreadcrumbTitle(item, t)}
                </span>
              );
            } else {
              return (
                <Link key={item.path} to={item.path}>
                  {breadcrumbSeparator}
                  {getBreadcrumbTitle(item, t)}
                </Link>
              );
            }
          })}
        </nav>
        <span>
          {album.credits.photographer ? <Link to={album.credits.photographer.path}>{t(r => r.aboutPhotographerLink)}</Link> : null}
        </span>
      </Container>
    </div>
  );
}

export default BreadcrumbBar;
