export type Format = "jpeg" | "webp" | "avif";
export type Role = "original" | "preview" | "thumbnail";

export interface Media {
  src: string;
  width: number;
  height: number;
  quality: number;
  additional_formats: Format[];
}

export const nullMedia: Media = {
  src: "",
  width: 0,
  height: 0,
  quality: 0,
  additional_formats: [],
};

// export default Media;
