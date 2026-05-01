import { useParams, Link, Navigate } from "react-router-dom";
import { Calendar, Clock, ChevronRight, ArrowLeft, ArrowRight, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import LandingNavbar from "@/components/landing/LandingNavbar";
import LandingFooter from "@/components/landing/LandingFooter";
import SEO from "@/components/SEO";
import JsonLd from "@/components/JsonLd";
import blogPosts from "@/data/blog-posts";
import { useRevealOnScroll } from "@/hooks/useRevealOnScroll";

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const revealRef = useRevealOnScroll<HTMLDivElement>();
  const post = blogPosts.find((p) => p.slug === slug);

  if (!post) return <Navigate to="/blog" replace />;

  const otherPosts = blogPosts.filter((p) => p.slug !== slug).slice(0, 3);

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    dateModified: post.date,
    author: { "@type": "Organization", name: post.author },
    publisher: {
      "@type": "Organization",
      name: "EZPOS",
      logo: { "@type": "ImageObject", url: "https://ezpos.id/icon-192.png" },
    },
    mainEntityOfPage: `https://ezpos.id/blog/${post.slug}`,
    ...(post.image ? { image: post.image } : {}),
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Beranda", item: "https://ezpos.id/" },
      { "@type": "ListItem", position: 2, name: "Blog", item: "https://ezpos.id/blog" },
      { "@type": "ListItem", position: 3, name: post.title, item: `https://ezpos.id/blog/${post.slug}` },
    ],
  };

  return (
    <div ref={revealRef} className="min-h-screen bg-background">
      <SEO title={`${post.title} — Blog EZPOS`} description={post.description} path={`/blog/${post.slug}`} />
      <JsonLd data={[articleSchema, breadcrumbSchema]} />
      <LandingNavbar />

      <main className="container max-w-3xl px-4 py-12 md:px-6 md:py-20">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-8 flex items-center gap-1 text-sm text-muted-foreground">
          <Link to="/" className="hover:text-primary">Beranda</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <Link to="/blog" className="hover:text-primary">Blog</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="truncate text-foreground">{post.title}</span>
        </nav>

        {/* Accent line */}
        <div className="mb-6 h-1 w-16 rounded-full bg-primary" />

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5">
          {post.tags.map((tag) => (
            <span key={tag} className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
              {tag}
            </span>
          ))}
        </div>

        <h1 className="mt-4 font-display text-3xl font-extrabold tracking-tight text-foreground md:text-4xl leading-tight">
          {post.title}
        </h1>

        <div className="mt-5 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10">
              <User className="h-3.5 w-3.5 text-primary" />
            </span>
            {post.author}
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            {new Date(post.date).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            {post.readTime} menit baca
          </span>
        </div>

        {/* Article Content */}
        <article
          className="prose prose-neutral mt-10 max-w-none dark:prose-invert prose-headings:font-display prose-headings:font-bold prose-a:text-primary"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* CTA Box */}
        <div className="mt-12 rounded-2xl border border-primary/10 bg-primary/5 p-6 md:p-8 text-center">
          <h2 className="font-display text-xl font-bold text-foreground md:text-2xl">
            Tertarik Menggunakan EZPOS?
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
            Mulai kelola bisnis F&B Anda lebih efisien — gratis, langsung dari HP.
          </p>
          <Button asChild variant="cta" size="lg" className="mt-5">
            <Link to="/auth">
              Coba EZPOS Gratis <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        {/* Other Posts */}
        {otherPosts.length > 0 && (
          <section className="mt-16 border-t border-border pt-10">
            <h2 className="text-xl font-bold text-foreground">Artikel Lainnya</h2>
            <div className="mt-6 grid gap-6 sm:grid-cols-2">
              {otherPosts.map((p) => (
                <Link
                  key={p.slug}
                  to={`/blog/${p.slug}`}
                  className="group rounded-2xl border border-border bg-card p-5 transition-all duration-300 hover:shadow-lg hover:border-primary/20 hover:-translate-y-1"
                >
                  <h3 className="font-display font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                    {p.title}
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{p.description}</p>
                </Link>
              ))}
            </div>
          </section>
        )}

        <Link
          to="/blog"
          className="mt-10 inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
        >
          <ArrowLeft className="h-4 w-4" /> Kembali ke Blog
        </Link>
      </main>

      <LandingFooter />
    </div>
  );
};

export default BlogPost;