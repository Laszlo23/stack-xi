import { Link } from "@tanstack/react-router";
import { ArrowRight, Clock, Tag } from "lucide-react";
import { formatBlogDate, getBlogPosts, type BlogPost } from "@/lib/blog/posts";
import { absoluteUrl } from "@/lib/seo/site-config";

export function BlogIndexPage() {
  const posts = getBlogPosts();

  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 sm:py-20">
      <header className="max-w-2xl">
        <div className="font-mono text-[10px] uppercase tracking-widest text-primary">Blog</div>
        <h1 className="mt-3 font-display text-4xl font-bold tracking-tight sm:text-5xl">
          Matchday notes from the squad
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
          Culture, Base onchain mechanics, and builder stories from STACK XI — Pepe lore with
          receipts.
        </p>
      </header>

      <div className="mt-12 space-y-6">
        {posts.map((post, index) => (
          <BlogPostCard key={post.slug} post={post} featured={index === 0} />
        ))}
      </div>

      <p className="mt-12 font-mono text-xs text-muted-foreground">
        RSS-friendly index · {posts.length} posts ·{" "}
        <a href={absoluteUrl("/blog")} className="text-primary hover:underline">
          {absoluteUrl("/blog")}
        </a>
      </p>
    </div>
  );
}

function BlogPostCard({ post, featured }: { post: BlogPost; featured?: boolean }) {
  return (
    <article
      className={`group overflow-hidden rounded-2xl border transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-[0_0_40px_oklch(0.88_0.28_145/0.12)] ${
        featured ? "border-primary/30 bg-primary/5" : "glass border-border/60"
      }`}
    >
      <Link to="/blog/$slug" params={{ slug: post.slug }} className="block p-6 sm:p-8">
        <div className="flex flex-wrap items-center gap-3 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          <span className="text-primary">{post.category}</span>
          <span>·</span>
          <time dateTime={post.publishedAt}>{formatBlogDate(post.publishedAt)}</time>
          <span>·</span>
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {post.readTimeMinutes} min read
          </span>
        </div>

        <h2 className="mt-3 font-display text-2xl font-bold leading-tight group-hover:text-primary sm:text-3xl">
          {post.title}
        </h2>
        <p className="mt-3 max-w-2xl leading-relaxed text-muted-foreground">{post.excerpt}</p>

        <div className="mt-4 flex flex-wrap gap-2">
          {post.tags.slice(0, 4).map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 rounded-full border border-border/60 px-2 py-0.5 font-mono text-[10px] uppercase text-muted-foreground"
            >
              <Tag className="h-2.5 w-2.5" />
              {tag}
            </span>
          ))}
        </div>

        <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-primary">
          Read post
          <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
        </span>
      </Link>
    </article>
  );
}
