import Image from "next/image";

// Static photos go through next/image; photos uploaded in HQ are served by
// /api/photo with a cache-busting query, so they render as plain <img>.
export default function Photo({
  src,
  alt,
  className,
  width = 600,
  height = 1200,
  sizes = "(max-width: 768px) 50vw, 320px",
}: {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  sizes?: string;
}) {
  if (src.startsWith("/api/")) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={alt} className={className} loading="lazy" />;
  }
  return (
    <Image src={src} alt={alt} width={width} height={height} className={className} sizes={sizes} />
  );
}
