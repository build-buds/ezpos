import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAppState } from "@/contexts/AppContext";

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  body: string | null;
  type: string;
  data: Record<string, any>;
  read: boolean;
  created_at: string;
}

export const useNotifications = () => {
  const { user } = useAppState();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(50);

    if (data) {
      setNotifications(data as unknown as Notification[]);
      setUnreadCount(data.filter((n: any) => !n.read).length);
    }
    setIsLoading(false);
  }, [user]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Realtime subscription
  useEffect(() => {
    if (!user?.id) return;

    let isCancelled = false;
    let activeChannel: ReturnType<typeof supabase.channel> | null = null;
    const topicPrefix = `notifications-${user.id}`;

    const setupChannel = async () => {
      const existingChannels = supabase
        .getChannels()
        .filter((channel) => channel.topic.startsWith(`realtime:${topicPrefix}`));

      await Promise.all(existingChannels.map((channel) => supabase.removeChannel(channel)));

      if (isCancelled) return;

      const channel = supabase.channel(`${topicPrefix}-${crypto.randomUUID()}`);
      activeChannel = channel;

      channel.on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const newNotif = payload.new as unknown as Notification;
          setNotifications((prev) => {
            if (prev.some((notif) => notif.id === newNotif.id)) return prev;
            return [newNotif, ...prev];
          });
          if (!newNotif.read) {
            setUnreadCount((prev) => prev + 1);
          }
        }
      );

      channel.subscribe();
    };

    void setupChannel();

    return () => {
      isCancelled = true;
      if (activeChannel) {
        void supabase.removeChannel(activeChannel);
      }
    };
  }, [user?.id]);

  const markAsRead = async (id: string) => {
    await supabase.from("notifications").update({ read: true }).eq("id", id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  const markAllAsRead = async () => {
    if (!user) return;
    await supabase
      .from("notifications")
      .update({ read: true })
      .eq("user_id", user.id)
      .eq("read", false);
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  return { notifications, unreadCount, isLoading, markAsRead, markAllAsRead, refetch: fetchNotifications };
};
