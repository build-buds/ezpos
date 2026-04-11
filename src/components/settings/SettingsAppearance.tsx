import { useState, useEffect } from "react";
import { Sun, Moon, Monitor } from "lucide-react";
import { cn } from "@/lib/utils";
import SettingsSheet from "./SettingsSheet";

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

  const themes: { id: Theme; icon: typeof Sun; label: string; description: string }[] = [
    { id: "light", icon: Sun, label: "Terang", description: "Tampilan cerah dan bersih" },
    { id: "dark", icon: Moon, label: "Gelap", description: "Lebih nyaman di malam hari" },
    { id: "system", icon: Monitor, label: "Sistem", description: "Ikuti pengaturan perangkat" },
  ];

  return (
    <SettingsSheet open={open} onClose={onClose} title="Tampilan">
      <div className="space-y-4">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Tema</p>
        <div className="space-y-3">
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
                  "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                  isActive ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                )}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="text-left flex-1 min-w-0">
                  <p className="text-sm font-semibold">{t.label}</p>
                  <p className="text-xs text-muted-foreground">{t.description}</p>
                </div>
                {isActive && (
                  <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center shrink-0">
                    <div className="w-2 h-2 rounded-full bg-primary-foreground" />
                  </div>
                )}
              </button>
            );
          })}
        </div>

        <div className="pt-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Bahasa</p>
          <div className="p-4 bg-muted/50 rounded-xl">
            <p className="text-sm font-semibold">Bahasa Indonesia</p>
            <p className="text-xs text-muted-foreground">Saat ini hanya tersedia dalam Bahasa Indonesia</p>
          </div>
        </div>
      </div>
    </SettingsSheet>
  );
};

export default SettingsAppearance;
