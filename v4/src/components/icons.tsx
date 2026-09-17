import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

/** Material Design icon paths (24px grid), inlined so no sprite file is needed. */
function icon(d: string) {
  return function Icon(props: IconProps) {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" {...props}>
        <path d={d} />
      </svg>
    );
  };
}

export const ChevronLeftIcon = icon(
  "M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z",
);
export const ChevronRightIcon = icon(
  "M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z",
);
export const CloseIcon = icon(
  "M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z",
);
export const DownloadIcon = icon(
  "M16 13h-3V3h-2v10H8l4 4 4-4zM4 19v2h16v-2H4z",
);
export const LockOpenIcon = icon(
  "M12 17c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm6-9h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6h1.9c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm0 12H6V10h12v10z",
);
export const LaunchIcon = icon(
  "M19 19H5V5h7V3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z",
);
export const WarningIcon = icon(
  "M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z",
);
export const PersonIcon = icon(
  "M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z",
);
export const PlayIcon = icon("M8 5v14l11-7z");
export const PauseIcon = icon("M6 19h4V5H6v14zm8-14v14h4V5h-4z");
export const MailIcon = icon(
  "M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z",
);
