import Image from "next/image";
import Link from "next/link";

export default function SiteFooter() {
  return (
    <footer className="bg-navy text-ice">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-[auto_1fr_auto] md:items-start">
        <Image src="/brand/logo.png" alt="Tower Blueprints for Kids" width={900} height={948} className="h-28 w-auto" />
        <div className="max-w-md">
          <p className="font-display text-xl text-white">A real business, run by a 7-year-old architect.</p>
          <p className="mt-2 text-sm leading-relaxed text-ice/80">
            Sawyer designs and tests every tower. His grown-up helpers handle email and checkout. Built with
            magnetic building blocks. Not affiliated with any toy brand.
          </p>
        </div>
        <nav className="flex flex-col gap-2 text-sm font-bold" aria-label="Footer">
          <Link href="/blueprints" className="hover:text-white">
            All blueprints
          </Link>
          <Link href="/watch" className="hover:text-white">
            Watch the towers build
          </Link>
          <Link href="/wall" className="hover:text-white">
            Builder Wall
          </Link>
          <Link href="/party" className="hover:text-white">
            Build-a-Tower Party
          </Link>
          <Link href="/your-design" className="hover:text-white">
            Make my design a blueprint
          </Link>
          <Link href="/#club" className="hover:text-white">
            Builders Club
          </Link>
          <Link href="/grown-ups" className="hover:text-white">
            For grown-ups &amp; privacy
          </Link>
          <Link href="/hq" className="text-ice/50 hover:text-white">
            Architect HQ
          </Link>
        </nav>
      </div>
      <div className="border-t border-white/10 py-4 text-center text-xs text-ice/60">
        © {new Date().getFullYear()} Tower Blueprints for Kids
      </div>
    </footer>
  );
}
