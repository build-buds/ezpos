import { useState } from "react";
import { Bell, Check, CheckCheck, ShoppingCart, AlertTriangle, Info, X } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNotifications, Notification } from "@/hooks/useNotifications";
import { cn } from "@/lib/utils";

const typeIcons: Record<string, typeof Info> = {
  transaction: ShoppingCart,
  stock: AlertTriangle,
  info: Info,
};

const typeColors: Record<string, string> = {
  transaction: "text-primary bg-primary/10",
  stock: "text-warning bg-warning/10",
  info: "text-muted-foreground bg-muted",
};

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Baru saja";
  if (mins < 60) return `${mins} menit lalu`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} jam lalu`;
  const days = Math.floor(hours / 24);
  return `${days} hari lalu`;
}

const NotificationItem = ({ notif, onRead }: { notif: Notification; onRead: (id: string) => void }) => {
  const Icon = typeIcons[notif.type] || Info;
  const colorClass = typeColors[notif.type] || typeColors.info;

  return (
    <button
      onClick={() => !notif.read && onRead(notif.id)}
      className={cn(
        "w-full text-left p-3 flex gap-3 transition-colors",
        notif.read ? "opacity-60" : "bg-accent/30"
      )}
    >
      <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shrink-0", colorClass)}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">{notif.title}</p>
        {notif.body && <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{notif.body}</p>}
        <p className="text-[10px] text-muted-foreground mt-1">{timeAgo(notif.created_at)}</p>
      </div>
      {!notif.read && <div className="w-2 h-2 rounded-full bg-primary shrink-0 mt-2" />}
    </button>
  );
};

const NotificationBell = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button className="relative w-10 h-10 rounded-full bg-primary-foreground/20 flex items-center justify-center">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end" sideOffset={8}>
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <h3 className="text-sm font-semibold text-foreground">Notifikasi</h3>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" className="h-7 text-xs gap-1" onClick={markAllAsRead}>
              <CheckCheck className="w-3 h-3" /> Tandai semua dibaca
            </Button>
          )}
        </div>
        <ScrollArea className="max-h-80">
          {notifications.length === 0 ? (
            <div className="p-8 text-center">
              <Bell className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Belum ada notifikasi</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {notifications.map((notif) => (
                <NotificationItem key={notif.id} notif={notif} onRead={markAsRead} />
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationBell;
