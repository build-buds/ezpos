import { useState, useEffect } from "react";
import { X, Sun, Moon, Monitor } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  open: boolean;
  onClose: () => void;
}

type Theme = "light" | "dark" | "system";

const getStoredTheme = (): Theme => {
  return (localStorage.getItem("ezpos_theme") as Theme) || "light";
};

const applyTheme = (theme: Theme) => {
  const root = document.documentElement;
  if (theme === "system") {
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    root.classList.toggle("dark", prefersDark);
  } else {
    root.classList.toggle("dark", theme === "dark");
  }
  localStorage.setItem("ezpos_theme", theme);
};

const SettingsAppearance = ({ open, onClose }: Props) => {
  const [theme, setTheme] = useState<Theme>(getStoredTheme);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  if (!open) return null;

  const themes: { id: Theme; icon: typeof Sun; label: string; description: string }[] = [
    { id: "light", icon: Sun, label: "Terang", description: "Tampilan cerah dan bersih" },
    { id: "dark", icon: Moon, label: "Gelap", description: "Lebih nyaman di malam hari" },
    { id: "system", icon: Monitor, label: "Sistem", description: "Ikuti pengaturan perangkat" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex flex-col">
      <div className="flex-1 bg-foreground/40" onClick={onClose} />
      <div className="bg-card rounded-t-3xl max-w-lg md:max-w-2xl mx-auto w-full animate-slide-up max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b shrink-0">
          <h2 className="text-lg font-bold">Tampilan</h2>
          <button onClick={onClose}><X className="w-5 h-5 text-muted-foreground" /></button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-3">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Tema</p>
          {themes.map((t) => {
            const Icon = t.icon;
            const isActive = theme === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTheme(t.id)}
                className={cn(
                  "w-full flex items-center gap-3 p-4 rounded-xl transition-all border-2",
                  isActive
                    ? "border-primary bg-primary/5"
                    : "border-transparent bg-muted/50 hover:bg-muted"
                )}
              >
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center",
                  isActive ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                )}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="text-left flex-1">
                  <p className="text-sm font-semibold">{t.label}</p>
                  <p className="text-xs text-muted-foreground">{t.description}</p>
                </div>
                {isActive && (
                  <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-primary-foreground" />
                  </div>
                )}
              </button>
            );
          })}

          <div className="pt-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Bahasa</p>
            <div className="p-4 bg-muted/50 rounded-xl">
              <p className="text-sm font-semibold">Bahasa Indonesia</p>
              <p className="text-xs text-muted-foreground">Saat ini hanya tersedia dalam Bahasa Indonesia</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsAppearance;
