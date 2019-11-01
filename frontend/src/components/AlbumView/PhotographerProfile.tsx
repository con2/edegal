import React from 'react';
import Photographer from '../../models/Photographer';
import Picture from '../../models/Picture';
import { Link } from 'react-router-dom';
import { T } from '../../translations';

interface PhotographerProfileProps {
  photographer: Photographer;
  coverPicture?: Picture;
  body?: string;
}

const PhotographerProfile: React.FC<PhotographerProfileProps> = ({ photographer, coverPicture, body }) => {
  const t = T(r => r.DownloadAlbumDialog);

  // Portrait photos get slightly less width budget to prevent them from becoming overtly tall.
  const className = coverPicture && coverPicture.thumbnail.height > coverPicture.thumbnail.width ? 'col-md-3' : 'col-md-4';

  // TODO Icons
  const socialMediaLinks = [
    [photographer.twitter_handle, 'Twitter', `https://twitter.com/${photographer.twitter_handle}`],
    [photographer.instagram_handle, 'Instagram', `https://instagram.com/${photographer.instagram_handle}`],
    [photographer.facebook_handle, 'Facebook', `https://facebook.com/${photographer.facebook_handle}`],
  ].filter(([handle]) => handle);

  return (
    <div className="container">
      <div className="row">
        <div className="col-md">
          <h1>{photographer.display_name}</h1>

          <ul className="PhotographerProfile-socialMediaLinks">
            {socialMediaLinks.map(([handle, label, link]) => (
              <li>
                <a href={link} target="_blank" rel="noopener noreferrer" title={`${label}: ${handle}`}>
                  {label}
                </a>
              </li>
            ))}
          </ul>

          {body ? <article dangerouslySetInnerHTML={{ __html: body || '' }} /> : null}
        </div>

        {coverPicture ? (
          <figure className={className}>
            <Link to={coverPicture.path}>
              <img
                src={coverPicture.thumbnail.src}
                alt={coverPicture.title}
                style={{
                  display: 'block',
                  width: '100%',
                }}
              />
            </Link>
            {coverPicture.credits && coverPicture.credits.photographer ? (
              <figcaption className="small text-muted text-right">
                <strong>{t(r => r.photographer)}:</strong>{' '}
                <Link to={coverPicture.credits.photographer.path}>{coverPicture.credits.photographer.display_name}</Link>
              </figcaption>
            ) : null}
          </figure>
        ) : null}
      </div>
    </div>
  );
};

export default PhotographerProfile;
