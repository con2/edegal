export type Format = 'jpeg' | 'webp';
export type Role = 'original' | 'preview' | 'thumbnail';


export interface Media {
  src: string;
  width: number;
  height: number;
  quality: number;
  format: Format;
  role: Role;
}


export const nullMedia: Media = {
  src: '',
  width: 0,
  height: 0,
  quality: 0,
  format: 'jpeg',
  role: 'thumbnail',
};


// export default Media;
