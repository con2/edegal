import React, {PropTypes} from 'react';
import md5 from 'blueimp-md5';

import PaperAvatar from './PaperAvatar';


// TODO Move this to backend
function getEmailHash(email) {
  const
    cache = getEmailHash.cache,
    normalizedEmail = email.trim().toLowerCase();

  if (!cache[normalizedEmail]) cache[normalizedEmail] = md5(normalizedEmail);

  return cache[normalizedEmail];
}
getEmailHash.cache = {};


const Gravatar = ({name, email = ''}) => {
  const
    hash = getEmailHash(email),
    src = `https://secure.gravatar.com/avatar/${hash}?d=mm`;

  if (name && !email) {
    const firstLetter = name[0].toUpperCase();

    return <PaperAvatar letter={firstLetter} />;
  }

  return <PaperAvatar src={src} />;
};


Gravatar.propTypes = {
  name: PropTypes.string,
  email: PropTypes.string,
};


export default Gravatar;
