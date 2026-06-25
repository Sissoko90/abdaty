'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useToast } from '@/components/toast-provider';
import {
  listAdminNotifications,
  markAllAdminNotificationsRead,
  type BackendNotification,
} from '@/services/notification.service';

/** Notification telle qu'affichée dans la cloche admin (historique + temps réel). */
export interface AdminNotification {
  id: string;
  type: string;
  title: string;
  message: string;
  link?: string;
  isRead: boolean;
  createdAt?: string;
}

/** Base WebSocket dérivée de l'API (http→ws, https→wss), sans le chemin. */
function wsBase(): string {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
  try {
    const u = new URL(apiUrl);
    return `${u.protocol === 'https:' ? 'wss:' : 'ws:'}//${u.host}`;
  } catch {
    return 'ws://localhost:8080';
  }
}

function clientId(): string {
  try {
    return crypto.randomUUID();
  } catch {
    return `n_${Date.now()}_${Math.floor(Math.random() * 1e6)}`;
  }
}

/**
 * Notifications push admin en temps réel.
 *
 * - Charge l'historique (GET /notifications/admin) au montage.
 * - Ouvre un WebSocket /ws/notifications (token en query param) ; à chaque
 *   événement (nouveau message de contact, alerte…), incrémente le compteur,
 *   ajoute l'élément en tête et déclenche un toast.
 * - Reconnexion automatique en cas de coupure.
 *
 * Actif uniquement pour un utilisateur ADMIN authentifié.
 */
export function useAdminNotifications() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const token = session?.accessToken;
  const isAdmin = (session?.user?.role || '').toString().toUpperCase() === 'ADMIN';

  const [items, setItems] = useState<AdminNotification[]>([]);
  const [unread, setUnread] = useState(0);

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 1. Historique initial.
  useEffect(() => {
    if (!token || !isAdmin) return;
    listAdminNotifications(token)
      .then((list: BackendNotification[]) => {
        setItems(list.map((n) => ({ ...n, type: String(n.type) })));
        setUnread(list.filter((n) => !n.isRead).length);
      })
      .catch(() => {
        /* historique indisponible : on garde le temps réel */
      });
  }, [token, isAdmin]);

  // 2. Flux temps réel via WebSocket (avec reconnexion).
  useEffect(() => {
    if (!token || !isAdmin) return;
    let closedByUs = false;

    const connect = () => {
      const ws = new WebSocket(`${wsBase()}/ws/notifications?access_token=${encodeURIComponent(token)}`);
      wsRef.current = ws;

      ws.onmessage = (ev) => {
        try {
          const e = JSON.parse(ev.data as string);
          if (!e || e.error || !e.title) return;
          const item: AdminNotification = {
            id: clientId(),
            type: String(e.type || 'SYSTEM'),
            title: e.title,
            message: e.message,
            link: e.link || undefined,
            isRead: false,
            createdAt: e.timestamp ? new Date(e.timestamp).toISOString() : undefined,
          };
          setItems((prev) => [item, ...prev].slice(0, 50));
          setUnread((u) => u + 1);
          toast({
            variant: e.type === 'ALERT' ? 'warning' : 'default',
            title: e.title,
            description: e.message,
          });
        } catch {
          /* message illisible : ignoré */
        }
      };

      ws.onclose = () => {
        if (closedByUs) return;
        reconnectRef.current = setTimeout(connect, 5000); // reconnexion
      };
      ws.onerror = () => ws.close();
    };

    connect();
    return () => {
      closedByUs = true;
      if (reconnectRef.current) clearTimeout(reconnectRef.current);
      wsRef.current?.close();
    };
  }, [token, isAdmin, toast]);

  const markAllRead = useCallback(async () => {
    setUnread(0);
    setItems((prev) => prev.map((i) => ({ ...i, isRead: true })));
    if (token) {
      await markAllAdminNotificationsRead(token).catch(() => {});
    }
  }, [token]);

  return { items, unread, markAllRead, isAdmin };
}
