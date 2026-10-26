export default function PageHero({ eyebrow, title, subtitle }: { eyebrow?: string; title: string; subtitle?: string }) {
  return (
    <section className="relative overflow-hidden bg-cream">
      <div aria-hidden className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-gold/20 blur-3xl" />
      <div className="container-x relative py-14 sm:py-20">
        {eyebrow && <p className="eyebrow flex items-center gap-3"><span className="gold-rule" />{eyebrow}</p>}
        <h1 className="mt-3 max-w-4xl text-4xl font-semibold leading-tight text-navy sm:text-6xl">{title}</h1>
        {subtitle && <p className="mt-4 max-w-2xl text-lg text-body/80">{subtitle}</p>}
      </div>
    </section>
  );
}
