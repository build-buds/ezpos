import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const faqs = [
  { q: "Apakah EZPOS benar-benar gratis?", a: "Ya, paket Gratis tersedia selamanya tanpa biaya tersembunyi. Anda hanya bayar jika butuh fitur Pro." },
  { q: "Apakah saya butuh hardware khusus?", a: "Tidak. EZPOS bisa dijalankan di HP, tablet, atau laptop apa saja melalui browser. Tidak perlu install software." },
  { q: "Bagaimana keamanan data saya?", a: "Data Anda terenkripsi end-to-end dan disimpan di server cloud yang aman dengan backup harian otomatis." },
  { q: "Bisakah dipakai offline?", a: "Ya, EZPOS mendukung mode offline (PWA). Transaksi tetap bisa diproses dan akan tersinkron saat online kembali." },
  { q: "Bagaimana cara upgrade ke Pro?", a: "Cukup klik tombol Upgrade di halaman harga, lakukan pembayaran, dan akun Anda otomatis aktif paket Pro." },
  { q: "Apakah ada kontrak jangka panjang?", a: "Tidak ada. Berlangganan bulanan dan bisa dibatalkan kapan saja tanpa penalti." },
];

const LandingFAQ = () => {
  return (
    <section id="faq" className="bg-muted/30 py-20 md:py-28">
      <div className="container max-w-3xl px-4 md:px-6">
        <div className="text-center">
          <h2 className="font-display text-3xl font-extrabold tracking-tight text-foreground md:text-5xl">
            Pertanyaan <span className="text-primary">yang sering ditanya</span>
          </h2>
        </div>

        <Accordion type="single" collapsible className="mt-12">
          {faqs.map((f, i) => (
            <AccordionItem key={i} value={`item-${i}`}>
              <AccordionTrigger className="text-left font-semibold">{f.q}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">{f.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
};

export default LandingFAQ;
