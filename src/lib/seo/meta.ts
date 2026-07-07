import {
  DEFAULT_KEYWORDS,
  DEFAULT_OG_IMAGE,
  DEFAULT_OG_IMAGE_ALT,
  DEFAULT_OG_IMAGE_HEIGHT,
  DEFAULT_OG_IMAGE_WIDTH,
  HREFLANG_LOCALES,
  GOOGLE_SITE_VERIFICATION,
  SITE_DESCRIPTION,
  SITE_EMAIL,
  SITE_LOCALE,
  SITE_NAME,
  SITE_ORG,
  SITE_URL,
  THEME_COLOR,
  TWITTER_CREATOR,
  TWITTER_HANDLE,
  absoluteUrl,
  pageTitle,
} from "./site-config";

export type SeoHead = {
  meta: Array<Record<string, unknown>>;
  links?: Array<Record<string, string>>;
};

export type PageSeoInput = {
  title: string;
  description: string;
  path: string;
  home?: boolean;
  ogType?: "website" | "article";
  ogImage?: string;
  ogImageAlt?: string;
  robots?: string;
  keywords?: string[];
  jsonLd?: object | object[];
  article?: {
    publishedTime: string;
    modifiedTime?: string;
    author: string;
    section?: string;
    tags?: string[];
  };
};

export function buildPageSeo(input: PageSeoInput): SeoHead {
  const url = absoluteUrl(input.path);
  const title = pageTitle(input.title, { home: input.home });
  const description = input.description;
  const ogImage = input.ogImage ?? DEFAULT_OG_IMAGE;
  const ogImageAlt = input.ogImageAlt ?? DEFAULT_OG_IMAGE_ALT;
  const keywords = [...new Set([...(input.keywords ?? []), ...DEFAULT_KEYWORDS])].join(", ");
  const robots =
    input.robots ?? "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1";

  const meta: Array<Record<string, unknown>> = [
    { title },
    { name: "description", content: description },
    { name: "author", content: SITE_ORG },
    { name: "keywords", content: keywords },
    { name: "robots", content: robots },
    { name: "googlebot", content: robots },
    { name: "theme-color", content: THEME_COLOR },
    { name: "color-scheme", content: "dark" },
    { name: "application-name", content: SITE_NAME },
    { name: "apple-mobile-web-app-title", content: SITE_NAME },
    { name: "apple-mobile-web-app-capable", content: "yes" },
    { name: "apple-mobile-web-app-status-bar-style", content: "black-translucent" },
    { name: "mobile-web-app-capable", content: "yes" },
    { name: "format-detection", content: "telephone=no" },
    { property: "og:site_name", content: SITE_NAME },
    { property: "og:locale", content: SITE_LOCALE },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:url", content: url },
    { property: "og:type", content: input.ogType ?? "website" },
    { property: "og:image", content: ogImage },
    { property: "og:image:secure_url", content: ogImage },
    { property: "og:image:alt", content: ogImageAlt },
    { property: "og:image:width", content: String(DEFAULT_OG_IMAGE_WIDTH) },
    { property: "og:image:height", content: String(DEFAULT_OG_IMAGE_HEIGHT) },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:site", content: TWITTER_HANDLE },
    { name: "twitter:creator", content: TWITTER_CREATOR },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
    { name: "twitter:image", content: ogImage },
    { name: "twitter:image:alt", content: ogImageAlt },
  ];

  if (GOOGLE_SITE_VERIFICATION) {
    meta.push({ name: "google-site-verification", content: GOOGLE_SITE_VERIFICATION });
  }

  if (input.article) {
    meta.push(
      { property: "article:published_time", content: input.article.publishedTime },
      { property: "article:author", content: input.article.author },
    );
    if (input.article.modifiedTime) {
      meta.push({ property: "article:modified_time", content: input.article.modifiedTime });
    }
    if (input.article.section) {
      meta.push({ property: "article:section", content: input.article.section });
    }
    for (const tag of input.article.tags ?? []) {
      meta.push({ property: "article:tag", content: tag });
    }
  }

  const jsonLdItems = normalizeJsonLd(input.jsonLd);
  for (const item of jsonLdItems) {
    meta.push({ "script:ld+json": item });
  }

  return {
    meta,
    links: [
      { rel: "canonical", href: url },
      ...HREFLANG_LOCALES.map((lang) => ({ rel: "alternate", href: url, hrefLang: lang })),
      { rel: "alternate", href: url, hrefLang: "x-default" },
    ],
  };
}

function normalizeJsonLd(jsonLd?: object | object[]): object[] {
  if (!jsonLd) return [];
  return Array.isArray(jsonLd) ? jsonLd : [jsonLd];
}

export function buildHomeJsonLd(): object[] {
  return [
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: SITE_NAME,
      url: SITE_URL,
      description: SITE_DESCRIPTION,
      inLanguage: "en",
      publisher: {
        "@type": "Organization",
        name: SITE_ORG,
        url: SITE_URL,
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: SITE_ORG,
      url: SITE_URL,
      logo: DEFAULT_OG_IMAGE,
      sameAs: [
        "https://x.com/buildingcultu3",
        "https://farcaster.xyz/0xleonardo",
        "https://basescan.org",
      ],
      contactPoint: {
        "@type": "ContactPoint",
        email: SITE_EMAIL,
        contactType: "customer support",
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      name: SITE_NAME,
      url: SITE_URL,
      applicationCategory: ["GameApplication", "SocialNetworkingApplication"],
      operatingSystem: "Web",
      description: SITE_DESCRIPTION,
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
      },
    },
    buildFaqJsonLd(),
  ];
}

export function buildFaqJsonLd(): object {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "What is BCC on STACK XI?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "BCC (Building Culture Coin) is the Clanker-launched token on Base used to mint founding squad NFTs, stake matchday predictions, and swap via embedded 0x routes.",
        },
      },
      {
        "@type": "Question",
        name: "How do I mint a squad player?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Connect a Base wallet, acquire BCC via the in-app swap or external DEX, approve BCC for the squad contract, and mint from the bonding curve starting at 770 BCC.",
        },
      },
      {
        "@type": "Question",
        name: "Where is onchain proof?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Visit the Onchain Proof page for contract addresses, DexScreener liquidity, swap widget, and your mint and prediction transaction receipts on BaseScan.",
        },
      },
    ],
  };
}

export function buildContractRegistryJsonLd(
  items: Array<{ name: string; address: string }>,
): object {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `${SITE_NAME} contract registry`,
    description: "Verified BCC, squad NFT, and prediction pool contracts on Base mainnet.",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      url: `${SITE_URL}/proof#${item.name.toLowerCase().replace(/\s+/g, "-")}`,
      item: {
        "@type": "Thing",
        name: item.name,
        identifier: item.address,
      },
    })),
  };
}

export function buildBlogIndexJsonLd(postCount: number): object {
  return {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: `${SITE_NAME} Blog`,
    url: absoluteUrl("/blog"),
    description:
      "Building Culture matchday stories, Base BCC onchain guides, and builder notes from STACK XI.",
    blogPost: postCount,
    publisher: {
      "@type": "Organization",
      name: SITE_ORG,
      url: SITE_URL,
    },
  };
}

export function buildBlogPostJsonLd(post: {
  title: string;
  excerpt: string;
  slug: string;
  publishedAt: string;
  updatedAt?: string;
  author: string;
  heroImage?: string;
}): object {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    url: absoluteUrl(`/blog/${post.slug}`),
    datePublished: post.publishedAt,
    dateModified: post.updatedAt ?? post.publishedAt,
    author: {
      "@type": "Person",
      name: post.author,
    },
    publisher: {
      "@type": "Organization",
      name: SITE_ORG,
      url: SITE_URL,
      logo: {
        "@type": "ImageObject",
        url: DEFAULT_OG_IMAGE,
      },
    },
    image: post.heroImage ?? DEFAULT_OG_IMAGE,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": absoluteUrl(`/blog/${post.slug}`),
    },
  };
}

export function buildBreadcrumbJsonLd(items: Array<{ name: string; path: string }>): object {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function buildMatchEventJsonLd(match: {
  home: string;
  away: string;
  stage: string;
  kickoffAt: Date;
  slug: string;
}): object {
  return {
    "@context": "https://schema.org",
    "@type": "SportsEvent",
    name: `${match.home} vs ${match.away}`,
    description: `Predict ${match.home} vs ${match.away} on STACK XI — ${match.stage}`,
    startDate: match.kickoffAt.toISOString(),
    sport: "Soccer",
    url: absoluteUrl(`/match/${match.slug}`),
    organizer: {
      "@type": "Organization",
      name: SITE_ORG,
      url: SITE_URL,
    },
  };
}
