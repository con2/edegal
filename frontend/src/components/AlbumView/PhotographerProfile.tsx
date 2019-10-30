import React from 'react';
import Photographer from '../../models/Photographer';
import Picture from '../../models/Picture';
import { Link } from 'react-router-dom';
import { T } from '../../translations';

interface PhotographerProfileProps {
  photographer: Photographer;
  coverPicture?: Picture;
}

const PhotographerProfile: React.FC<PhotographerProfileProps> = ({ photographer, coverPicture }) => {
  const t = T(r => r.DownloadAlbumDialog);

  return (
    <div className="container">
      <div className="row">
        <div className="col-md-8">
          <h1>{photographer.display_name}</h1>

          {photographer.twitter_handle ? (
            <p>
              <strong>Twitter:</strong>{' '}
              <a href={`https://twitter.com/${photographer.twitter_handle}`} target="_blank" rel="noopener noreferrer">
                @{photographer.twitter_handle}
              </a>
            </p>
          ) : null}

          {photographer.instagram_handle ? (
            <p>
              <strong>Instagram:</strong>{' '}
              <a href={`https://instagram.com/${photographer.instagram_handle}`} target="_blank" rel="noopener noreferrer">
                @{photographer.instagram_handle}
              </a>
            </p>
          ) : null}
        </div>

        {coverPicture ? (
          <figure className="col-md">
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
