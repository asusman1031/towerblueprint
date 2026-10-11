import type { Metadata } from "next";
import BlueprintPeek from "@/components/BlueprintPeek";
import DesignRequestForm from "@/components/DesignRequestForm";
import Track from "@/components/Track";
import { getSettings } from "@/lib/data";
import { formatPrice, SAMPLE_CUSTOM_TOWER } from "@/lib/tower";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Sawyer will make your design a blueprint",
  description:
    "Built an awesome magnetic block tower? Send it to Sawyer and he'll turn your design into an official blueprint with layer maps, block math, and a certificate.",
};

const STEPS = [
  ["🏗️", "Build your tower", "Any size, any shape. Stack it up with your magnetic blocks."],
  ["📸", "Send it to Sawyer", "Snap a photo and tell him how you built it, layer by layer."],
  ["📐", "Sawyer makes the blueprint", "He turns your design into an official blueprint with your name on it."],
  ["🖨️", "Print it and share it", "Your friends can build your tower too!"],
];

export default async function YourDesignPage() {
  const settings = await getSettings();

  return (
    <>
      <Track />
      <section className="bg-grid-blue overflow-x-clip text-white">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-14 sm:px-6 md:grid-cols-[1.2fr_1fr]">
          <div>
            <span className="rounded-full border-2 border-navy bg-sun px-3 py-1 font-display text-navy">
              New! Custom blueprints
            </span>
            <h1 className="mt-4 font-display text-4xl leading-[1.05] sm:text-5xl md:text-6xl">
              Built an awesome tower?
              <br />
              <span className="text-sun">Sawyer will make your design a blueprint too!</span>
            </h1>
            <p className="mt-4 text-lg font-semibold text-ice">
              Send Sawyer your tower and he&apos;ll turn it into an official blueprint: a drawing of your tower, the
              block math, a map of every layer, and an &ldquo;I built it!&rdquo; certificate with your name as the
              designer.
            </p>
            <p className="mt-5 font-display text-2xl">
              {formatPrice(settings.customPriceCents)} <span className="text-base text-ice">per custom blueprint</span>
            </p>
          </div>
          <BlueprintPeek sections={SAMPLE_CUSTOM_TOWER.sections} name={SAMPLE_CUSTOM_TOWER.name} badge="Sample" />
        </div>
      </section>

      <section className="bg-grid-light border-y-[3px] border-navy">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
          <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map(([icon, title, body], i) => (
              <li key={title} className="card p-5">
                <div className="flex items-center gap-3">
                  <span className="text-3xl" aria-hidden>
                    {icon}
                  </span>
                  <span className="font-display text-lg text-brand">Step {i + 1}</span>
                </div>
                <h2 className="mt-2 font-display text-2xl text-navy">{title}</h2>
                <p className="mt-1 text-ink">{body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section id="send" className="mx-auto max-w-3xl scroll-mt-20 px-4 py-14 sm:px-6">
        <div className="card p-6 sm:p-8">
          <h2 className="font-display text-4xl text-navy">Send your tower to Sawyer</h2>
          {settings.customOpen ? (
            <>
              <p className="mt-2 mb-6 text-ink">
                Sawyer reads every one. If he can make your blueprint, his team will email you to confirm and send a way
                to pay ({formatPrice(settings.customPriceCents)}). Nothing is charged now.
              </p>
              <DesignRequestForm />
            </>
          ) : (
            <p className="mt-3 text-lg text-ink">
              Sawyer&apos;s design desk is full right now! Join the Builders Club on the home page to hear when it opens
              again.
            </p>
          )}
        </div>
      </section>
    </>
  );
}
