import { Product } from "@/types";

export const SAMPLE_PRODUCTS: Product[] = [
  { id: "1", name: "Nasi Goreng Spesial", description: "Nasi goreng dengan telur, ayam, dan sayuran", price: 25000, costPrice: 12000, image: "", category: "Makanan", stock: 50, minStock: 10 },
  { id: "2", name: "Mie Ayam Bakso", description: "Mie ayam dengan bakso sapi pilihan", price: 20000, costPrice: 9000, image: "", category: "Makanan", stock: 30, minStock: 5 },
  { id: "3", name: "Es Teh Manis", description: "Teh manis segar dengan es batu", price: 5000, costPrice: 1500, image: "", category: "Minuman", stock: 100, minStock: 20 },
  { id: "4", name: "Kopi Susu", description: "Kopi susu gula aren", price: 15000, costPrice: 5000, image: "", category: "Minuman", stock: 80, minStock: 15 },
  { id: "5", name: "Ayam Geprek", description: "Ayam geprek sambal bawang level pilihan", price: 22000, costPrice: 10000, image: "", category: "Makanan", stock: 25, minStock: 5, hasModifier: true },
  { id: "6", name: "Indomie Goreng", description: "Indomie goreng telur + keju", price: 12000, costPrice: 5000, image: "", category: "Makanan", stock: 60, minStock: 10 },
  { id: "7", name: "Soto Ayam", description: "Soto ayam kuah bening khas Jawa", price: 18000, costPrice: 8000, image: "", category: "Makanan", stock: 20, minStock: 5 },
  { id: "8", name: "Jus Alpukat", description: "Jus alpukat segar dengan susu coklat", price: 12000, costPrice: 5000, image: "", category: "Minuman", stock: 40, minStock: 10 },
  { id: "9", name: "Tahu Crispy", description: "Tahu goreng crispy dengan sambal kecap", price: 8000, costPrice: 3000, image: "", category: "Snack", stock: 45, minStock: 10 },
  { id: "10", name: "Pisang Goreng", description: "Pisang goreng crispy madu", price: 10000, costPrice: 4000, image: "", category: "Snack", stock: 35, minStock: 8 },
];

export const PRODUCT_CATEGORIES = ["Semua", "Makanan", "Minuman", "Snack"];

export const formatRupiah = (amount: number): string => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount);
};
