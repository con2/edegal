import * as React from 'react';
import md5 = require('blueimp-md5');

import { LetterAvatar, PictureAvatar } from './PaperAvatar';


export interface GravatarProps {
  name: string;
  email?: string;
}
interface GravatarState {}


export default class Gravatar extends React.Component<GravatarProps, GravatarState> {
  render() {
    const name = this.props.name;
    const email = this.props.email || '';

    if (name && !email) {
      const firstLetter = name[0].toUpperCase();

      return <LetterAvatar letter={firstLetter} />;
    } else {
      const hash = md5(email.trim().toLowerCase()); // TODO Move this to backend
      const src = `https://secure.gravatar.com/avatar/${hash}?d=mm`;

      return <PictureAvatar src={src} />;
    }
  }
}
