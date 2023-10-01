import React from "react";
import Link from "next/link";

import Photographer, { LarppikuvatProfile } from "../../models/Photographer";
import Picture from "../../models/Picture";
import Linebreaks from "../Linebreaks";
import { T } from "../../translations";

interface PhotographerProfileProps {
  photographer: Photographer;
  coverPicture?: Picture;
  body?: string;
}

const larppikuvatProfileKeys: (keyof LarppikuvatProfile)[] = [
  "contact",
  "hours",
  "delivery_schedule",
  "delivery_practice",
  "delivery_method",
  "copy_protection",
  "expected_compensation",
];

const PhotographerProfile: React.FC<PhotographerProfileProps> = ({
  photographer,
  coverPicture,
  body,
}) => {
  const t = T((r) => r.DownloadAlbumDialog);
  const larppikuvaT = T((r) => r.LarppikuvatProfile);

  // Portrait photos get slightly less width budget to prevent them from becoming overtly tall.
  const className =
    coverPicture && coverPicture.thumbnail.height > coverPicture.thumbnail.width
      ? "col-md-3"
      : "col-md-4";

  // TODO Icons
  const socialMediaLinks = [
    [
      photographer.twitter_handle,
      "Twitter",
      `https://twitter.com/${photographer.twitter_handle}`,
    ],
    [
      photographer.instagram_handle,
      "Instagram",
      `https://instagram.com/${photographer.instagram_handle}`,
    ],
    [
      photographer.facebook_handle,
      "Facebook",
      `https://facebook.com/${photographer.facebook_handle}`,
    ],
    [
      photographer.flickr_handle,
      "Flickr",
      `https://flickr.com/photos/${photographer.flickr_handle}`,
    ],
  ].filter(([handle]) => handle);

  const larppikuvatProfileItems: [keyof LarppikuvatProfile, string][] = [];
  if (photographer.larppikuvat_profile) {
    for (const key of larppikuvatProfileKeys) {
      if (photographer.larppikuvat_profile[key]) {
        larppikuvatProfileItems.push([
          key,
          photographer.larppikuvat_profile[key],
        ]);
      }
    }
  }

  return (
    <div className="container">
      <div className="row">
        <div className="col-md">
          <h1>{photographer.display_name}</h1>

          <ul className="PhotographerProfile-socialMediaLinks">
            {socialMediaLinks.map(([handle, label, link]) => (
              <li key={label}>
                <a
                  href={link}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={`${label}: ${handle}`}
                >
                  {label}
                </a>
              </li>
            ))}
          </ul>

          {body ? (
            <article dangerouslySetInnerHTML={{ __html: body || "" }} />
          ) : null}

          {larppikuvatProfileItems.length ? (
            <dd className="PhotographerProfile-larppikuvatProfile">
              {larppikuvatProfileItems.map(([key, value]) => (
                <React.Fragment key={key}>
                  <dt>{larppikuvaT((r) => r[key])}</dt>
                  {["contact", "delivery_method", "copy_protection"].includes(
                    key
                  ) ? (
                    <dd dangerouslySetInnerHTML={{ __html: value }} />
                  ) : (
                    <dd>
                      <Linebreaks text={value} />
                    </dd>
                  )}
                </React.Fragment>
              ))}
            </dd>
          ) : null}
        </div>

        {coverPicture ? (
          <figure className={className}>
            <Link href={coverPicture.path}>
              <img
                src={coverPicture.thumbnail.src}
                alt={coverPicture.title}
                style={{
                  display: "block",
                  width: "100%",
                }}
              />
            </Link>
            {coverPicture.credits ? (
              <figcaption className="small text-muted text-right">
                {coverPicture.credits.photographer ? (
                  <div>
                    <strong>{t((r) => r.photographer)}:</strong>{" "}
                    <Link href={coverPicture.credits.photographer.path}>
                      {coverPicture.credits.photographer.display_name}
                    </Link>
                  </div>
                ) : null}
                {coverPicture.credits.director ? (
                  <div>
                    <strong>{t((r) => r.director)}:</strong>{" "}
                    <Link href={coverPicture.credits.director.path}>
                      {coverPicture.credits.director.display_name}
                    </Link>
                  </div>
                ) : null}
              </figcaption>
            ) : null}
          </figure>
        ) : null}
      </div>
    </div>
  );
};

export default PhotographerProfile;
