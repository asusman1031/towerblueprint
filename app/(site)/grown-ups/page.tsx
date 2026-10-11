import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "For grown-ups & privacy",
  description: "How Tower Blueprints for Kids works for parents, and what we do with your information.",
};

export default function GrownUpsPage() {
  return (
    <div className="bg-grid-light">
      <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
        <h1 className="font-display text-5xl text-navy">For grown-ups</h1>
        <div className="card mt-8 space-y-6 p-7 text-lg leading-relaxed text-ink">
          <section>
            <h2 className="font-display text-2xl text-navy">What this is</h2>
            <p className="mt-2">
              Tower Blueprints for Kids is a small business started by Sawyer, a 7-year-old who designs giant towers out
              of magnetic cube blocks. He builds and tests every design, then we turn it into a printable, step-by-step
              blueprint that other kids can follow. His parents run the grown-up parts: email, payments, and support.
            </p>
          </section>
          <section>
            <h2 className="font-display text-2xl text-navy">What you&apos;re buying</h2>
            <p className="mt-2">
              Each official blueprint is a printable document: a cover drawing, a parts list, a layer-by-layer build
              guide, and an &ldquo;I built it!&rdquo; certificate. Blocks are not included. The designs work with standard
              magnetic cube blocks; we are not affiliated with any toy brand.
            </p>
          </section>
          <section>
            <h2 className="font-display text-2xl text-navy">Privacy</h2>
            <p className="mt-2">
              This site is for kids to browse, but only grown-ups (18+) can sign up or order. We don&apos;t knowingly
              collect personal information from children.
            </p>
            <ul className="mt-3 list-disc space-y-1 pl-6">
              <li>If you join the Builders Club or reserve a blueprint, we store your email to contact you about it.</li>
              <li>We never sell or share your email. Ask us and we&apos;ll delete it.</li>
              <li>We count page visits in total (no cookies, no ad trackers) so Sawyer can see how his business is doing.</li>
              <li>Payments are handled by our payment processor; we never see your card number.</li>
            </ul>
          </section>
          <section>
            <h2 className="font-display text-2xl text-navy">Safety tip</h2>
            <p className="mt-2">
              Tall towers can tip over. Build on a hard floor, away from stairs, and help younger builders with the top
              sections. Magnetic toys are not for children who still put things in their mouths; follow the age guidance
              on your blocks.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
