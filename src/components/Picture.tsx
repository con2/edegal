import type { MediaSet } from "@/gallery/types";

interface PictureProps {
  media: MediaSet;
  alt: string;
  className?: string;
  loading?: "lazy" | "eager";
  sizes?: string;
  /** Rendered `<img>` dimensions; defaults to the fallback media's intrinsic size. */
  width?: number;
  height?: number;
  fetchPriority?: "high" | "low" | "auto";
}

/** `<picture>` with one `<source>` per alternate format and the jpeg as `<img>` fallback. */
export function Picture({
  media,
  alt,
  className,
  loading,
  width,
  height,
  fetchPriority,
}: PictureProps) {
  return (
    <picture className={className}>
      {media.alternates.map((alternate) => (
        <source
          key={alternate.format}
          srcSet={alternate.src}
          type={`image/${alternate.format}`}
        />
      ))}
      <img
        src={media.fallback.src}
        alt={alt}
        loading={loading}
        width={width ?? media.fallback.width}
        height={height ?? media.fallback.height}
        fetchPriority={fetchPriority}
      />
    </picture>
  );
}
