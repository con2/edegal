import React, {PropTypes} from 'react';
import Avatar from 'material-ui/Avatar';
import Paper from 'material-ui/Paper';


const PictureAvatar = ({src}) => (
  <Paper
    circle
    style={{
      height: '40px',
      display: 'inline-block',
      position: 'relative',
      top: 2,
      marginLeft: 8,
    }}
  >
    <Avatar src={src} />
  </Paper>
);


PictureAvatar.propTypes = {
  src: PropTypes.string,
};


const LetterAvatar = ({letter}) => (
  <Paper
    circle
    style={{
      height: '40px',
      display: 'inline-block',
      position: 'relative',
      top: -10,
      marginLeft: 8,
    }}
  >
    <Avatar>{letter}</Avatar>
  </Paper>
);


LetterAvatar.propTypes = {
  src: PropTypes.string,
  letter: PropTypes.string,
};


const PaperAvatar = ({src, letter}) => (
  src ? <PictureAvatar src={src} /> : <LetterAvatar letter={letter} />
);

PaperAvatar.propTypes = {
  src: PropTypes.string,
  letter: PropTypes.string,
};


export default PaperAvatar;
