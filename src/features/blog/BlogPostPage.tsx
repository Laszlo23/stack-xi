import { Link } from "@tanstack/react-router";
import { ArrowLeft, Clock, Tag } from "lucide-react";
import { formatBlogDate, type BlogPost } from "@/lib/blog/posts";

export function BlogPostPage({ post }: { post: BlogPost }) {
  return (
    <article className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-20">
      <Link
        to="/blog"
        className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-muted-foreground hover:text-primary"
      >
        <ArrowLeft className="h-4 w-4" />
        All posts
      </Link>

      <header className="mt-8">
        <div className="flex flex-wrap items-center gap-3 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          <span className="text-primary">{post.category}</span>
          <span>·</span>
          <time dateTime={post.publishedAt}>{formatBlogDate(post.publishedAt)}</time>
          {post.updatedAt && post.updatedAt !== post.publishedAt && (
            <>
              <span>·</span>
              <span>Updated {formatBlogDate(post.updatedAt)}</span>
            </>
          )}
          <span>·</span>
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {post.readTimeMinutes} min read
          </span>
        </div>

        <h1 className="mt-4 font-display text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
          {post.title}
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-muted-foreground">{post.excerpt}</p>
        <p className="mt-4 font-mono text-xs text-muted-foreground">By {post.author}</p>

        <div className="mt-5 flex flex-wrap gap-2">
          {post.tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 rounded-full border border-border/60 px-2.5 py-1 font-mono text-[10px] uppercase text-muted-foreground"
            >
              <Tag className="h-2.5 w-2.5" />
              {tag}
            </span>
          ))}
        </div>
      </header>

      {post.heroImage && (
        <div className="mt-10 overflow-hidden rounded-2xl border border-border/60">
          <img
            src={post.heroImage}
            alt=""
            width={1200}
            height={630}
            className="aspect-[16/9] w-full object-cover"
            loading="eager"
          />
        </div>
      )}

      <div className="prose-stack mt-10 space-y-10">
        {post.sections.map((section, index) => (
          <section key={section.heading ?? index}>
            {section.heading && (
              <h2 className="font-display text-2xl font-bold">{section.heading}</h2>
            )}
            <div className={`space-y-4 ${section.heading ? "mt-4" : ""}`}>
              {section.paragraphs.map((paragraph) => (
                <p key={paragraph.slice(0, 40)} className="leading-relaxed text-muted-foreground">
                  {paragraph}
                </p>
              ))}
            </div>
          </section>
        ))}
      </div>

      <footer className="mt-14 rounded-2xl border border-primary/30 bg-primary/5 p-6">
        <p className="font-display text-lg font-bold">Ready for matchday?</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Mint the founding squad, stake a USDC prediction, or complete culture missions on your
          profile.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            to="/"
            hash="squad"
            className="rounded-lg bg-primary px-4 py-2 text-sm font-bold text-primary-foreground hover:brightness-110"
          >
            Mint squad
          </Link>
          <Link
            to="/"
            hash="predict"
            className="rounded-lg border border-primary/40 px-4 py-2 text-sm font-semibold text-primary hover:bg-primary/10"
          >
            Predict match
          </Link>
          <Link
            to="/profile"
            className="rounded-lg border border-border px-4 py-2 text-sm font-semibold text-foreground hover:border-primary/50"
          >
            Member profile
          </Link>
        </div>
      </footer>
    </article>
  );
}
