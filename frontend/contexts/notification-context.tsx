'use client';

import { createContext, useCallback, useContext, useEffect, useState, ReactNode } from 'react';
import { useSession } from 'next-auth/react';
import {
  listNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotificationApi,
  type BackendNotification,
} from '@/services/notification.service';

interface Notification {
  id: string;
  title: string;
  message: string;
  date: string;
  read: boolean;
  type: 'info' | 'success' | 'warning' | 'error';
  link?: string;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: string) => void;
  addNotification: (notification: Omit<Notification, 'id' | 'date'>) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

/** Convertit une notification du backend vers le modèle local d'affichage. */
function toLocal(n: BackendNotification): Notification {
  return {
    id: n.id,
    title: n.title,
    message: n.message,
    date: n.createdAt ? new Date(n.createdAt).toLocaleString() : '',
    read: n.isRead,
    type: n.type,
    link: n.link,
  };
}

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { data: session } = useSession();
  const token = session?.accessToken;
  const userId = session?.user?.id;

  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Charge les notifications de l'utilisateur connecté depuis le backend.
  useEffect(() => {
    if (!token || !userId) {
      setNotifications([]);
      return;
    }
    let cancelled = false;
    listNotifications(token, userId)
      .then((list) => {
        if (!cancelled) setNotifications(list.map(toLocal));
      })
      .catch(() => {
        // Backend indisponible : on n'affiche rien plutôt que des données fictives.
        if (!cancelled) setNotifications([]);
      });
    return () => {
      cancelled = true;
    };
  }, [token, userId]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = useCallback(
    (id: string) => {
      // Mise à jour optimiste puis appel backend.
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
      if (token && userId) {
        markNotificationRead(id, token, userId).catch(() => {});
      }
    },
    [token, userId]
  );

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    if (token && userId) {
      markAllNotificationsRead(token, userId).catch(() => {});
    }
  }, [token, userId]);

  const deleteNotification = useCallback(
    (id: string) => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      if (token && userId) {
        deleteNotificationApi(id, token, userId).catch(() => {});
      }
    },
    [token, userId]
  );

  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'date'>) => {
    // Notification éphémère côté client (les notifications persistées sont créées
    // par le backend). On préfixe l'id pour éviter toute collision.
    const newNotification: Notification = {
      ...notification,
      id: `local-${Date.now()}`,
      date: "À l'instant",
    };
    setNotifications((prev) => [newNotification, ...prev]);
  }, []);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        addNotification,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}
