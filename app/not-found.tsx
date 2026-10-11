import Link from "next/link";

export default function NotFound() {
  return (
    <main className="bg-grid-blue flex min-h-screen flex-col items-center justify-center px-4 text-center text-white">
      <p className="font-display text-8xl text-sun">404</p>
      <h1 className="mt-2 font-display text-4xl">This tower fell over!</h1>
      <p className="mt-3 max-w-md text-lg text-ice">We couldn&apos;t find that page. Let&apos;s build something else.</p>
      <Link href="/" className="btn btn-sun mt-8">
        Back to the home page
      </Link>
    </main>
  );
}
