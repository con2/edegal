interface Media {
  src: string;
  width: number;
  height: number;
  quality: number;
  original: boolean;
}


export const nullMedia = {
  src: '',
  width: 0,
  height: 0,
  quality: 0,
  original: false,
};


export default Media;
