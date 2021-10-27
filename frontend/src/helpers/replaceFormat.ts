import { Format } from '../models/Media';

export default function replaceFormat(src: string, format: Format): string {
  const parts = src.split('.');
  return parts
    .slice(0, -1)
    .concat([format])
    .join('.');
}
