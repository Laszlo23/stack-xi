import { useState } from "react";
import { Handshake, Mail, Sparkles, Users } from "lucide-react";
import { buildPartnerMailto } from "@/lib/site/links";

const BENEFITS = [
  {
    icon: Sparkles,
    title: "Distribution calendar",
    detail: "14-day viral post playbook with Farcaster casts, X memes, and PNG share cards.",
  },
  {
    icon: Users,
    title: "DeFi layer exposure",
    detail: "Co-branded presence in the BCC culture layer — predictions, squad, and swap flows.",
  },
  {
    icon: Handshake,
    title: "Matchday activations",
    detail: "World Cup matchday hooks, meme cards, and builder-tag loops for your community.",
  },
] as const;

export function PartnersPage() {
  const [orgName, setOrgName] = useState("");
  const [contactName, setContactName] = useState("");
  const [email, setEmail] = useState("");
  const [channel, setChannel] = useState("");
  const [useCase, setUseCase] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const mailto = buildPartnerMailto({ orgName, contactName, email, channel, useCase });
    window.location.href = mailto;
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-20">
      <header>
        <div className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-primary">
          <Handshake className="h-3.5 w-3.5" />
          Partners
        </div>
        <h1 className="mt-3 font-display text-4xl font-bold tracking-tight sm:text-5xl">
          Partner with STACK XI
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
          Culture distribution as a product feature — matchday activations, BCC ecosystem exposure,
          and co-branded viral loops for your community.
        </p>
      </header>

      <div className="mt-10 grid gap-4 sm:grid-cols-3">
        {BENEFITS.map(({ icon: Icon, title, detail }) => (
          <div key={title} className="glass rounded-xl p-5">
            <Icon className="h-5 w-5 text-primary" />
            <h2 className="mt-3 font-display font-bold">{title}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{detail}</p>
          </div>
        ))}
      </div>

      <form
        onSubmit={handleSubmit}
        className="mt-12 space-y-5 rounded-2xl border border-border/60 p-6 sm:p-8"
      >
        <h2 className="font-display text-xl font-bold">Partner application</h2>
        <p className="text-sm text-muted-foreground">
          Submit opens your email client to{" "}
          <strong className="text-foreground">office@buildingculture.capital</strong>
        </p>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm">
            <span className="font-mono text-[10px] uppercase text-muted-foreground">
              Organization
            </span>
            <input
              required
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
              className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none ring-primary/30 focus:ring-2"
            />
          </label>
          <label className="block text-sm">
            <span className="font-mono text-[10px] uppercase text-muted-foreground">
              Contact name
            </span>
            <input
              required
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none ring-primary/30 focus:ring-2"
            />
          </label>
        </div>

        <label className="block text-sm">
          <span className="font-mono text-[10px] uppercase text-muted-foreground">Email</span>
          <input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none ring-primary/30 focus:ring-2"
          />
        </label>

        <label className="block text-sm">
          <span className="font-mono text-[10px] uppercase text-muted-foreground">
            Farcaster / X / Telegram handle
          </span>
          <input
            required
            value={channel}
            onChange={(e) => setChannel(e.target.value)}
            placeholder="@handle"
            className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none ring-primary/30 focus:ring-2"
          />
        </label>

        <label className="block text-sm">
          <span className="font-mono text-[10px] uppercase text-muted-foreground">
            Partnership use case
          </span>
          <textarea
            required
            rows={4}
            value={useCase}
            onChange={(e) => setUseCase(e.target.value)}
            className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none ring-primary/30 focus:ring-2"
            placeholder="Tell us about your community and what you want to build together…"
          />
        </label>

        <button
          type="submit"
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-primary-foreground shadow-[0_0_24px_var(--neon)] hover:brightness-110"
        >
          <Mail className="h-4 w-4" />
          Send application via email
        </button>
      </form>
    </div>
  );
}
