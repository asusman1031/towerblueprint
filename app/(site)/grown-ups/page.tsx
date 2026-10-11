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
              of magnetic cube blocks. He builds and tests every design and writes the blueprint himself, so other kids
              can build it too. His parents run the grown-up parts: email, payments, and support.
            </p>
          </section>
          <section>
            <h2 className="font-display text-2xl text-navy">What you&apos;re buying</h2>
            <p className="mt-2">
              Each blueprint is Sawyer&apos;s original: the instructions he wrote and a photo of his finished tower, as
              a printable file. Blocks are not included. The designs work with standard magnetic cube blocks; we are
              not affiliated with any toy brand.
            </p>
            <p className="mt-3">
              <strong>Custom blueprints:</strong> kids can send Sawyer their own tower design. If he can make it, we
              email you to confirm and arrange payment first. He then turns it into an official blueprint (a drawing,
              block math, layer-by-layer maps, and a certificate) that only you get the link to.
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
              <li>
                If you send a design, we store your email, the details you type, and the tower photo, only to make the
                blueprint. Please send photos of towers only, with no people in them.
              </li>
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
