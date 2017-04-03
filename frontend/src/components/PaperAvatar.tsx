import * as React from 'react';
import Avatar from 'material-ui/Avatar';
import Paper from 'material-ui/Paper';


const paperAvatarStyle = {
  height: '40px',
  display: 'inline-block',
  position: 'relative',
  marginLeft: 8,
};
const pictureAvatarStyle = Object.assign({}, paperAvatarStyle, { top: 2 });
const letterAvatarStyle = Object.assign({}, paperAvatarStyle, { top: -10 });


interface PictureAvatarProps {
  src: string;
}
interface PictureAvatarState {}


export class PictureAvatar extends React.Component<PictureAvatarProps, PictureAvatarState> {
  render() {
      return <Paper circle={true} style={pictureAvatarStyle}><Avatar src={this.props.src} /></Paper>;
  }
}


interface LetterAvatarProps {
  letter: string;
}
interface LetterAvatarState {}


export class LetterAvatar extends React.Component<LetterAvatarProps, LetterAvatarState> {
  render() {
    return <Paper circle={true} style={letterAvatarStyle}><Avatar>{this.props.letter}</Avatar></Paper>;
  }
}
