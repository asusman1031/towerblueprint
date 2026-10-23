import Image from "next/image";
import Link from "next/link";

const NAV = [
  { href: "/blueprints", label: "Blueprints" },
  { href: "/watch", label: "Watch" },
  { href: "/wall", label: "Builder Wall" },
  { href: "/your-design", label: "Your design" },
  { href: "/#how-it-works", label: "How it works" },
];

export default function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b-[3px] border-navy bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-2.5 sm:px-6">
        <Link href="/" className="wiggle flex shrink-0 items-center gap-2" aria-label="Tower Blueprints for Kids home">
          <Image src="/brand/mark.png" alt="" width={400} height={270} className="h-10 w-auto sm:h-11" priority />
          <span className="hidden font-display text-lg leading-[0.95] text-navy min-[420px]:block sm:text-xl">
            Tower
            <br />
            <span className="text-brand">Blueprints</span>
          </span>
        </Link>
        <nav className="ml-auto flex items-center gap-1 sm:gap-2" aria-label="Main">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className="hidden rounded-lg px-3 py-2 text-[0.95rem] font-extrabold text-ink hover:bg-ice md:block"
            >
              {n.label}
            </Link>
          ))}
          <Link href="/blueprints" className="rounded-lg px-3 py-2 text-[0.95rem] font-extrabold text-ink hover:bg-ice md:hidden">
            Blueprints
          </Link>
          <Link href="/#club" className="btn btn-sun btn-sm">
            Join the club
          </Link>
        </nav>
      </div>
    </header>
  );
}
