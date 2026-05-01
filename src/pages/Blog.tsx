import { Link } from "react-router-dom";
import { Calendar, Clock, ArrowRight } from "lucide-react";
import LandingNavbar from "@/components/landing/LandingNavbar";
import LandingFooter from "@/components/landing/LandingFooter";
import SEO from "@/components/SEO";
import JsonLd from "@/components/JsonLd";
import blogPosts from "@/data/blog-posts";
import { useRevealOnScroll } from "@/hooks/useRevealOnScroll";

const Blog = () => {
  const revealRef = useRevealOnScroll<HTMLDivElement>();

  const blogSchema = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: "Blog EZPOS",
    description: "Tips, panduan, dan insight seputar kasir POS, manajemen restoran, dan teknologi F&B di Indonesia.",
    url: "https://ezpos.id/blog",
    publisher: {
      "@type": "Organization",
      name: "EZPOS",
      logo: { "@type": "ImageObject", url: "https://ezpos.id/icon-192.png" },
    },
    blogPost: blogPosts.map((p) => ({
      "@type": "BlogPosting",
      headline: p.title,
      description: p.description,
      datePublished: p.date,
      author: { "@type": "Organization", name: p.author },
      url: `https://ezpos.id/blog/${p.slug}`,
    })),
  };

  return (
    <div ref={revealRef} className="min-h-screen bg-background">
      <SEO
        title="Blog EZPOS — Tips Kasir POS & Manajemen Restoran"
        description="Tips, panduan, dan insight seputar kasir POS, manajemen restoran, QR ordering, dan teknologi F&B di Indonesia."
        path="/blog"
      />
      <JsonLd data={blogSchema} />
      <LandingNavbar />

      <main className="container max-w-5xl px-4 py-16 md:px-6 md:py-24">
        <div className="text-center">
          <h1 className="font-display text-3xl font-extrabold tracking-tight text-foreground md:text-5xl">
            Blog <span className="text-primary">EZPOS</span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            Tips, panduan, dan insight seputar kasir POS, manajemen restoran, dan teknologi F&B.
          </p>
        </div>

        <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {blogPosts.map((post) => (
            <Link
              key={post.slug}
              to={`/blog/${post.slug}`}
              className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-shadow hover:shadow-md"
            >
              {post.image && (
                <div className="aspect-video w-full overflow-hidden bg-muted">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="h-full w-full object-cover transition-transform group-hover:scale-105"
                    loading="lazy"
                  />
                </div>
              )}
              <div className="flex flex-1 flex-col p-5">
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <h2 className="mt-3 text-lg font-bold leading-snug text-foreground group-hover:text-primary transition-colors line-clamp-2">
                  {post.title}
                </h2>
                <p className="mt-2 flex-1 text-sm text-muted-foreground line-clamp-3">
                  {post.description}
                </p>
                <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    {new Date(post.date).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    {post.readTime} menit baca
                  </span>
                </div>
                <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-primary">
                  Baca selengkapnya <ArrowRight className="h-4 w-4" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </main>

      <LandingFooter />
    </div>
  );
};

export default Blog;