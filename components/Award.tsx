// A prize ribbon for a blueprint that won an award, like "Best Design".
export default function Award({ award, className = "" }: { award: string; className?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border-2 border-navy bg-[linear-gradient(135deg,#FFE680,#F5B400)] px-3 py-0.5 font-display text-sm whitespace-nowrap text-navy shadow-[2px_2px_0_#0B1F4D] ${className}`}
    >
      <span aria-hidden>🏆</span> {award}
    </span>
  );
}
