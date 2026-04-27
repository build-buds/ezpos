import { useEffect, useState } from "react";
import MobileLayout from "@/components/MobileLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bell, Settings as SettingsIcon, History, Copy, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { useAppState } from "@/contexts/AppContext";
import { useQueueSettings } from "@/hooks/useQueue";
import { supabase } from "@/integrations/supabase/client";
import QueueLiveBoard from "@/components/queue/QueueLiveBoard";
import QueueSettingsForm from "@/components/queue/QueueSettingsForm";
import QueueHistory from "@/components/queue/QueueHistory";

const QueuePage = () => {
  const { businessId } = useAppState();
  const { data: settings } = useQueueSettings();
  const [slug, setSlug] = useState<string>("");

  useEffect(() => {
    const fetchSlug = async () => {
      if (!businessId) return;
      const { data } = await supabase.from("businesses").select("slug").eq("id", businessId).maybeSingle();
      if (data?.slug) setSlug(data.slug);
    };
    fetchSlug();
  }, [businessId]);

  const queueUrl = slug ? `${window.location.origin}/queue/${slug}` : "";

  return (
    <MobileLayout>
      <div className="px-5 md:px-8 lg:px-10 pt-10 lg:pt-8 pb-4 bg-primary text-primary-foreground">
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5" />
          <h1 className="text-lg md:text-xl font-bold">EZPOS Queue</h1>
        </div>
        <p className="text-xs opacity-80 mt-1">Manajemen antrian digital untuk F&B</p>
      </div>

      <div className="px-5 md:px-8 lg:px-10 py-4 lg:max-w-5xl lg:mx-auto">
        <Card className="p-3 mb-4 flex items-center gap-2">
          <Badge variant={settings?.enabled ? "default" : "secondary"}>
            {settings?.enabled ? "Antrian Aktif" : "Nonaktif"}
          </Badge>
          <div className="flex-1 min-w-0">
            {!slug ? (
              <p className="text-xs text-muted-foreground">Atur slug bisnis di Pengaturan untuk mendapatkan link antrian.</p>
            ) : (
              <Input value={queueUrl} readOnly className="text-xs h-8" />
            )}
          </div>
          {slug && (
            <>
              <Button
                size="icon"
                variant="outline"
                onClick={() => {
                  navigator.clipboard.writeText(queueUrl);
                  toast.success("Link disalin");
                }}
              >
                <Copy className="w-4 h-4" />
              </Button>
              <Button size="icon" variant="outline" onClick={() => window.open(queueUrl, "_blank")}>
                <ExternalLink className="w-4 h-4" />
              </Button>
            </>
          )}
        </Card>

        <Tabs defaultValue="live">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="live"><Bell className="w-4 h-4 mr-1" />Live</TabsTrigger>
            <TabsTrigger value="settings"><SettingsIcon className="w-4 h-4 mr-1" />Pengaturan</TabsTrigger>
            <TabsTrigger value="history"><History className="w-4 h-4 mr-1" />Riwayat</TabsTrigger>
          </TabsList>

          <TabsContent value="live" className="mt-4">
            <QueueLiveBoard />
          </TabsContent>
          <TabsContent value="settings" className="mt-4">
            <QueueSettingsForm />
          </TabsContent>
          <TabsContent value="history" className="mt-4">
            <QueueHistory />
          </TabsContent>
        </Tabs>
      </div>
    </MobileLayout>
  );
};

export default QueuePage;