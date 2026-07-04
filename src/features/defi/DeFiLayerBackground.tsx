export function DeFiLayerBackground() {
  return (
    <div
      className="defi-stadium-bg pointer-events-none absolute inset-0 overflow-hidden"
      aria-hidden
    >
      <div className="defi-stadium-sweep absolute inset-0 opacity-40" />
      <div className="defi-grid-fog absolute inset-0" />
      {Array.from({ length: 18 }).map((_, i) => (
        <span
          key={i}
          className="defi-usdc-particle absolute rounded-full bg-primary/30"
          style={{
            left: `${(i * 17 + 5) % 100}%`,
            top: `${(i * 23 + 11) % 100}%`,
            width: `${4 + (i % 3) * 2}px`,
            height: `${4 + (i % 3) * 2}px`,
            animationDelay: `${i * 0.45}s`,
            animationDuration: `${6 + (i % 4) * 2}s`,
          }}
        />
      ))}
    </div>
  );
}
