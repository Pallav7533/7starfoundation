import Link from "next/link";

export default function Logo({ size = 56, light = false }: { size?: number; light?: boolean }) {
  return (
    <Link href="/" className="flex items-center gap-3" aria-label="7 Star Help Foundation home">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/logo.jpg" alt="7 Star Help Foundation logo" width={size} height={size}
        className="rounded-full" style={{ width: size, height: size }} />
      <span className={`hidden leading-tight sm:block ${light ? "text-white" : "text-navy"}`}>
        <span className="block font-serif text-lg font-semibold">7 Star Help</span>
        <span className="block text-[11px] font-semibold uppercase tracking-[.25em] text-magenta">Foundation</span>
      </span>
    </Link>
  );
}
