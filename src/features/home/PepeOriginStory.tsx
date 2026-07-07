import { ExternalLink } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { PEPE_ORIGIN_CHAPTERS } from "@/lib/story/pepe-origin-chapters";
import { farcasterComposeUrl } from "@/lib/profile/social-links";

function xComposeUrl(text: string): string {
  return `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
}

export function PepeOriginStory() {
  const { t } = useTranslation();

  return (
    <section id="pepe-origin" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20">
      <div className="max-w-2xl">
        <div className="font-mono text-[10px] uppercase tracking-widest text-primary">
          {t("home.origin.eyebrow")}
        </div>
        <h2 className="mt-2 font-display text-3xl font-bold sm:text-4xl">{t("home.origin.title")}</h2>
        <p className="mt-3 text-muted-foreground">{t("home.origin.subtitle")}</p>
      </div>

      <div className="mt-10 grid gap-6 sm:grid-cols-2">
        {PEPE_ORIGIN_CHAPTERS.map((chapter) => (
          <article
            key={chapter.id}
            className="group overflow-hidden rounded-2xl border border-border/50 bg-background/60 transition hover:border-primary/40 hover:shadow-[0_0_32px_var(--neon)]"
          >
            <div className="relative aspect-[16/10] overflow-hidden">
              <img
                src={chapter.image}
                alt=""
                className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.03]"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
              <span className="absolute left-4 top-4 rounded-full bg-primary/90 px-2.5 py-0.5 font-mono text-[10px] font-bold text-primary-foreground">
                Ch. {chapter.chapter}
              </span>
            </div>
            <div className="p-5">
              <Link to="/story/$chapterId" params={{ chapterId: chapter.id }}>
                <h3 className="font-display text-xl font-bold hover:text-primary">{chapter.title}</h3>
              </Link>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{chapter.line}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <a
                  href={farcasterComposeUrl(chapter.sharePost)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 rounded-lg border border-primary/30 bg-primary/10 px-3 py-1.5 text-[11px] font-semibold text-primary hover:bg-primary/20"
                >
                  Cast <ExternalLink className="h-3 w-3" />
                </a>
                <a
                  href={xComposeUrl(chapter.sharePost)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 rounded-lg border border-border/60 px-3 py-1.5 text-[11px] font-semibold text-muted-foreground hover:text-primary"
                >
                  Post on X <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>
          </article>
        ))}
      </div>

      <div className="mt-8 text-center">
        <Link
          to="/story/visual"
          className="inline-flex rounded-xl border border-primary/40 px-5 py-2.5 text-sm font-semibold text-primary hover:bg-primary/10"
        >
          {t("home.origin.fullLore")}
        </Link>
      </div>
    </section>
  );
}
