import {
  ChefHat,
  Heart,
  Users,
  Link2,
  Monitor,
  Bell,
  Tv2,
  Smartphone,
  Printer,
  type LucideIcon,
} from "lucide-react";

export type ModuleStatus = "active" | "coming-soon";

export interface ModuleDef {
  slug: string;
  name: string;
  short: string;
  description: string;
  icon: LucideIcon;
  status: ModuleStatus;
  path?: string; // for active modules
  features: string[];
  isPro?: boolean;
}

export const MODULES: ModuleDef[] = [
  {
    slug: "kds",
    name: "Kitchen Display (KDS)",
    short: "Tampilan dapur digital real-time",
    description:
      "Layar dapur digital yang menerima order langsung dari kasir & menu QR. Staf dapur bisa mengubah status pesanan (baru → diproses → siap → diantar) tanpa kertas.",
    icon: ChefHat,
    status: "coming-soon",
    features: [
      "Real-time order dari POS & QR Order",
      "Notifikasi suara saat pesanan baru",
      "Estimasi waktu prepare otomatis",
      "Multi-station (panas, dingin, bar)",
    ],
    isPro: true,
  },
  {
    slug: "loyalty",
    name: "Loyalty Programme",
    short: "Program poin & member digital",
    description:
      "Program loyalty otomatis: setiap transaksi memberi poin pada pelanggan, yang bisa ditukar diskon. Member card digital tanpa kartu fisik.",
    icon: Heart,
    status: "active",
    path: "/loyalty",
    features: [
      "Poin & cashback otomatis dari transaksi",
      "Member card digital via no HP",
      "Voucher & promo dapat dikustomisasi",
      "Notifikasi WhatsApp ke member",
    ],
  },
  {
    slug: "crm",
    name: "CRM Pelanggan",
    short: "Kelola data & segmentasi pelanggan",
    description:
      "Customer Relationship Management terpadu: kumpulkan data pelanggan, segmentasi otomatis (VIP, regular, dorman), dan kirim broadcast WhatsApp dengan satu klik.",
    icon: Users,
    status: "coming-soon",
    features: [
      "Database pelanggan terpusat",
      "Segmentasi otomatis berdasarkan perilaku",
      "Riwayat transaksi per pelanggan",
      "Broadcast WhatsApp template",
    ],
    isPro: true,
  },
  {
    slug: "biolink",
    name: "Biolink Bisnis",
    short: "Satu link untuk semua channel",
    description:
      "Halaman bio bisnis Anda dalam satu link. Tampilkan menu digital, sosial media, lokasi, kontak, dan promo dalam satu tempat — cocok untuk bio Instagram & WhatsApp.",
    icon: Link2,
    status: "active",
    path: "/biolink",
    features: [
      "Halaman publik di /bio/nama-anda",
      "Drag & drop link kustom",
      "Tema bisa dipilih",
      "Statistik klik per link",
    ],
  },
  {
    slug: "kiosk",
    name: "EZPOS Kiosk",
    short: "Self-service ordering",
    description:
      "Kiosk pemesanan mandiri dengan layar sentuh. Pelanggan pesan & bayar sendiri tanpa antri di kasir, mengurangi beban staff dan meningkatkan rata-rata nilai pesanan.",
    icon: Monitor,
    status: "active",
    path: "/kiosk",
    features: [
      "Antarmuka layar sentuh intuitif",
      "Upselling otomatis",
      "Multi-bahasa",
      "Integrasi pembayaran QRIS",
    ],
    isPro: true,
  },
  {
    slug: "queue",
    name: "EZPOS Queue",
    short: "Manajemen antrian digital",
    description:
      "Sistem antrian digital modern. Pelanggan dapat nomor antrian via WhatsApp dan notifikasi real-time saat giliran tiba — tanpa kertas, tanpa kebingungan.",
    icon: Bell,
    status: "coming-soon",
    features: [
      "Nomor antrian otomatis via WhatsApp",
      "Notifikasi real-time",
      "Dashboard monitoring",
      "Estimasi waktu tunggu akurat",
    ],
    isPro: true,
  },
  {
    slug: "eds",
    name: "Expo Display (EDS)",
    short: "Display ekspedisi pesanan",
    description:
      "Display untuk koordinasi antara dapur dan pelayan. Pesanan yang sudah siap muncul di EDS, pelayan tahu kapan harus mengantar tanpa bolak-balik ke dapur.",
    icon: Tv2,
    status: "coming-soon",
    features: [
      "Sinkron dengan KDS",
      "Status 'siap diantar' real-time",
      "Notifikasi suara",
      "Multi-display",
    ],
    isPro: true,
  },
  {
    slug: "pda",
    name: "Waiter Device (PDA)",
    short: "Perangkat order genggam",
    description:
      "Perangkat genggam untuk waiter mengambil pesanan langsung di meja pelanggan, lalu order otomatis terkirim ke dapur tanpa harus kembali ke kasir.",
    icon: Smartphone,
    status: "coming-soon",
    features: [
      "Order langsung di meja",
      "Sinkron real-time ke KDS",
      "Mode offline",
      "Manajemen meja & sesi",
    ],
    isPro: true,
  },
  {
    slug: "cloud-printer",
    name: "Cloud Printer",
    short: "Cetak struk via jaringan",
    description:
      "Printer berbasis cloud yang bisa mencetak struk dan tiket dapur dari mana saja melalui jaringan, tanpa perlu kabel langsung ke perangkat kasir.",
    icon: Printer,
    status: "coming-soon",
    features: [
      "Cetak via WiFi/4G",
      "Tiket dapur otomatis ke printer dapur",
      "Multi-printer per outlet",
      "Backup printer otomatis",
    ],
    isPro: true,
  },
];

export const getModule = (slug: string) =>
  MODULES.find((m) => m.slug === slug);