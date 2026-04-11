import { useState, useEffect } from "react";
import { WifiOff, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

const OfflineBanner = () => {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const goOffline = () => setIsOffline(true);
    const goOnline = () => setIsOffline(false);
    window.addEventListener("offline", goOffline);
    window.addEventListener("online", goOnline);
    return () => {
      window.removeEventListener("offline", goOffline);
      window.removeEventListener("online", goOnline);
    };
  }, []);

  if (!isOffline) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-primary flex items-center justify-center text-primary-foreground p-6">
      <div className="text-center max-w-xs">
        <div className="w-16 h-16 rounded-2xl bg-primary-foreground/15 flex items-center justify-center mx-auto mb-6">
          <WifiOff className="w-8 h-8" />
        </div>
        <h1 className="text-xl font-bold mb-2">Kamu Sedang Offline</h1>
        <p className="text-sm opacity-85 leading-relaxed mb-6">
          Tidak ada koneksi internet. Periksa jaringanmu dan coba lagi.
        </p>
        <Button
          variant="secondary"
          className="bg-primary-foreground text-primary hover:bg-primary-foreground/90"
          onClick={() => window.location.reload()}
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Coba Lagi
        </Button>
      </div>
    </div>
  );
};

export default OfflineBanner;
