interface Media {
  src: string;
  width: number;
  height: number;
  quality: number;
  original: boolean;
  thumbnail: boolean;
}


export const nullMedia = {
  src: '',
  width: 0,
  height: 0,
  quality: 0,
  original: false,
  thumbnail: false,
};


export default Media;
