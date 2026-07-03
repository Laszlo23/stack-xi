export function SectionHead({
  eyebrow,
  title,
  sub,
}: {
  eyebrow: string;
  title: React.ReactNode;
  sub: string;
}) {
  return (
    <div className="max-w-2xl">
      <div className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-primary">
        <span className="h-1.5 w-1.5 rounded-full bg-primary" /> {eyebrow}
      </div>
      <h2 className="mt-4 font-display text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">
        {title}
      </h2>
      <p className="mt-3 text-muted-foreground">{sub}</p>
    </div>
  );
}
