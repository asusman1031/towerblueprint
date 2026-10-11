import Image from "next/image";

// Static photos go through next/image; photos uploaded in HQ are served by
// /api/photo with a cache-busting query, so they render as plain <img>.
export default function Photo({ src, alt, className }: { src: string; alt: string; className?: string }) {
  if (src.startsWith("/api/")) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={alt} className={className} loading="lazy" />;
  }
  return <Image src={src} alt={alt} width={600} height={1200} className={className} sizes="(max-width: 768px) 50vw, 300px" />;
}
