import jsPDF from "jspdf";
import QRCode from "qrcode";

interface MenuPdfOptions {
  businessName: string;
  title?: string;
  description?: string;
  logoUrl?: string;
  accentColor?: string;
  menuUrl: string;
}

const loadImageDataUrl = (url: string): Promise<string | null> =>
  new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        if (!ctx) return resolve(null);
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL("image/png"));
      } catch {
        resolve(null);
      }
    };
    img.onerror = () => resolve(null);
    img.src = url;
  });

const hexToRgb = (hex: string): [number, number, number] => {
  const m = hex.replace("#", "");
  const v = m.length === 3 ? m.split("").map((c) => c + c).join("") : m;
  const num = parseInt(v, 16);
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
};

export const generateMenuPdf = async (opts: MenuPdfOptions) => {
  const { businessName, title, description, logoUrl, accentColor = "#2563EB", menuUrl } = opts;

  // A5 portrait: 148 x 210 mm
  const doc = new jsPDF({ unit: "mm", format: "a5", orientation: "portrait" });
  const pageW = 148;
  const pageH = 210;
  const [r, g, b] = hexToRgb(accentColor);

  // Accent header bar
  doc.setFillColor(r, g, b);
  doc.rect(0, 0, pageW, 28, "F");

  // Logo (optional)
  let yCursor = 40;
  if (logoUrl) {
    const logoData = await loadImageDataUrl(logoUrl);
    if (logoData) {
      const size = 22;
      doc.addImage(logoData, "PNG", (pageW - size) / 2, 18, size, size);
      yCursor = 48;
    }
  }

  // Business name
  doc.setTextColor(20, 20, 20);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.text(businessName, pageW / 2, yCursor, { align: "center" });
  yCursor += 8;

  // Title
  if (title) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(r, g, b);
    doc.text(title, pageW / 2, yCursor, { align: "center" });
    yCursor += 7;
  }

  // Description
  if (description) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(90, 90, 90);
    const lines = doc.splitTextToSize(description, pageW - 30);
    doc.text(lines, pageW / 2, yCursor, { align: "center" });
    yCursor += lines.length * 5;
  }

  // QR code (centered)
  const qrSize = 70;
  const qrDataUrl = await QRCode.toDataURL(menuUrl, {
    width: 600,
    margin: 1,
    color: { dark: "#000000", light: "#FFFFFF" },
  });
  const qrY = Math.max(yCursor + 8, 100);
  doc.addImage(qrDataUrl, "PNG", (pageW - qrSize) / 2, qrY, qrSize, qrSize);

  // Footer instruction
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(20, 20, 20);
  doc.text("Scan untuk lihat menu", pageW / 2, qrY + qrSize + 10, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(120, 120, 120);
  doc.text(menuUrl, pageW / 2, qrY + qrSize + 16, { align: "center" });

  // Bottom accent
  doc.setFillColor(r, g, b);
  doc.rect(0, pageH - 6, pageW, 6, "F");

  doc.save(`menu-${businessName.toLowerCase().replace(/\s+/g, "-")}.pdf`);
};
