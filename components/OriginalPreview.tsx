import Photo from "@/components/Photo";

// A peek at Sawyer's own blueprint: blurred so the instructions stay a surprise.
export default function OriginalPreview({
  src,
  name,
  size = "lg",
}: {
  src: string;
  name: string;
  size?: "sm" | "lg";
}) {
  const box = size === "lg" ? "w-full max-w-xs" : "w-28";
  return (
    <figure className={`relative mx-auto ${box}`}>
      <div className="absolute inset-0 translate-x-2 translate-y-2 rotate-2 rounded-xl border-[3px] border-navy bg-ice" />
      <div className="relative -rotate-1 overflow-hidden rounded-xl border-[3px] border-navy bg-white">
        <Photo
          src={src}
          alt={`Blurred peek at Sawyer's original ${name} blueprint`}
          width={320}
          height={414}
          className="block aspect-[320/414] h-auto w-full object-cover"
        />
        <span
          className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rotate-[-6deg] rounded-xl border-[3px] border-navy bg-sun text-center font-display leading-tight text-navy shadow-[0_4px_0_#0b1f4d] ${
            size === "lg" ? "px-4 py-2 text-lg" : "px-1.5 py-0.5 text-[0.6rem]"
          }`}
        >
          🔒 Sawyer&apos;s original
          {size === "lg" ? <span className="block text-xs font-sans font-extrabold">Unlocks when you buy</span> : null}
        </span>
      </div>
    </figure>
  );
}
