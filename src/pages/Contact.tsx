import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { MapPin, Mail, Phone, Send, MessageCircle } from "lucide-react";
import { toast } from "sonner";

import LandingNavbar from "@/components/landing/LandingNavbar";
import LandingFooter from "@/components/landing/LandingFooter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useRevealOnScroll } from "@/hooks/useRevealOnScroll";

const WA_NUMBER = "6281234567890";

const contactSchema = z.object({
  name: z.string().trim().min(1, "Nama wajib diisi").max(100, "Maks. 100 karakter"),
  phone: z
    .string()
    .trim()
    .min(8, "Min. 8 digit")
    .max(20, "Maks. 20 digit")
    .regex(/^[0-9+\s-]+$/, "Hanya angka, +, spasi, atau -"),
  email: z.string().trim().email("Email tidak valid").max(255),
  subject: z.string().trim().min(1, "Subjek wajib diisi").max(150, "Maks. 150 karakter"),
  message: z.string().trim().max(1000, "Maks. 1000 karakter").optional().or(z.literal("")),
  consent: z.boolean().optional(),
});

type ContactValues = z.infer<typeof contactSchema>;

const ContactPage = () => {
  useRevealOnScroll();

  useEffect(() => {
    document.title = "Hubungi Kami — EZPOS";
    const desc =
      "Hubungi tim EZPOS untuk konsultasi, demo produk, atau pertanyaan seputar aplikasi POS Anda. Kami akan merespons dalam 24 jam.";
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.setAttribute("name", "description");
      document.head.appendChild(meta);
    }
    meta.setAttribute("content", desc);
  }, []);

  const form = useForm<ContactValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: { name: "", phone: "", email: "", subject: "", message: "", consent: false },
  });

  const onSubmit = (values: ContactValues) => {
    const text = [
      `Halo EZPOS, saya ingin terhubung.`,
      ``,
      `Nama: ${values.name}`,
      `No. HP: ${values.phone}`,
      `Email: ${values.email}`,
      `Subjek: ${values.subject}`,
      values.message ? `Pesan: ${values.message}` : null,
    ]
      .filter(Boolean)
      .join("\n");

    window.open(`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");
    toast.success("Pesan berhasil dikirim. Kami akan menghubungi Anda segera.");
    form.reset();
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <LandingNavbar />

      <main className="flex-1">
        {/* Content */}
        <section className="px-4 py-12 md:px-6 md:py-20">
          <div className="container max-w-6xl">
            <div
              className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm"
              data-reveal
            >
              <div className="grid gap-0 lg:grid-cols-2">
                {/* Left: info */}
                <div className="relative space-y-6 bg-muted/40 p-6 md:p-10">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-wider text-primary">
                    Hubungi Kami
                  </p>
                  <h2 className="mt-2 font-display text-3xl font-extrabold leading-tight text-foreground md:text-4xl">
                    Mari Terhubung dengan{" "}
                    <span className="text-primary">EZPOS</span>
                  </h2>
                  <p className="mt-4 text-base text-muted-foreground">
                    Kami akan menghubungi Anda kembali dalam 24 jam untuk menjawab pertanyaan Anda.
                  </p>
                </div>

                <div className="space-y-5 pt-2">
                  {[
                    {
                      icon: MapPin,
                      title: "Lokasi Kami",
                      lines: ["Jakarta Selatan, DKI Jakarta", "Indonesia"],
                    },
                    {
                      icon: Mail,
                      title: "Email Kami",
                      lines: ["halo@ezpos.id"],
                      href: "mailto:halo@ezpos.id",
                    },
                    {
                      icon: Phone,
                      title: "Kontak Kami",
                      lines: ["+62 812-3456-7890"],
                      href: `https://wa.me/${WA_NUMBER}`,
                    },
                  ].map((item) => {
                    const Icon = item.icon;
                    const Wrapper: any = item.href ? "a" : "div";
                    const wrapperProps = item.href
                      ? { href: item.href, target: "_blank", rel: "noopener noreferrer" }
                      : {};
                    return (
                      <Wrapper
                        key={item.title}
                        {...wrapperProps}
                        className="flex items-start gap-4"
                      >
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-foreground">{item.title}</p>
                          {item.lines.map((line) => (
                            <p key={line} className="mt-0.5 text-sm text-muted-foreground">
                              {line}
                            </p>
                          ))}
                        </div>
                      </Wrapper>
                    );
                  })}
                </div>
                </div>

                {/* Right: form */}
                <div className="bg-card p-6 md:p-10">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Nama <span className="text-primary">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="Nama lengkap" autoComplete="name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Nomor HP <span className="text-primary">*</span>
                          </FormLabel>
                          <FormControl>
                            <div className="flex">
                              <span className="inline-flex items-center rounded-l-md border border-r-0 border-input bg-muted px-3 text-sm text-muted-foreground">
                                +62
                              </span>
                              <Input
                                type="tel"
                                inputMode="tel"
                                placeholder="81234567890"
                                autoComplete="tel"
                                className="rounded-l-none"
                                {...field}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Email <span className="text-primary">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              placeholder="nama@email.com"
                              autoComplete="email"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="subject"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Subjek <span className="text-primary">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="Topik yang ingin dibahas" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="message"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Pesan</FormLabel>
                          <FormControl>
                            <Textarea
                              rows={5}
                              placeholder="Tuliskan pesan Anda…"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="consent"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start gap-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={!!field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <FormLabel className="text-sm font-normal text-muted-foreground">
                            Saya setuju menerima informasi & promosi dari EZPOS.
                          </FormLabel>
                        </FormItem>
                      )}
                    />

                    <Button type="submit" variant="cta" size="lg" className="w-full">
                      Kirim
                      <Send className="ml-1 h-4 w-4" />
                    </Button>
                  </form>
                </Form>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <LandingFooter />

      {/* Floating WhatsApp */}
      <a
        href={`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent("Halo EZPOS, saya ingin bertanya.")}`}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-4 right-4 z-40 inline-flex items-center gap-2 rounded-full bg-[#25D366] px-4 py-3 text-sm font-semibold text-white shadow-lg transition-transform hover:scale-105 md:bottom-6 md:right-6"
        aria-label="Chat di WhatsApp"
      >
        <MessageCircle className="h-5 w-5" />
        <span className="hidden sm:inline">Chat di WhatsApp</span>
      </a>
    </div>
  );
};

export default ContactPage;
