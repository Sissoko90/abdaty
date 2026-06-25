'use client';

import type { Route } from 'next';
import { useTranslations } from 'next-intl';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bell, Check, Trash2, X } from 'lucide-react';
import Link from 'next/link';
import { useNotifications } from '@/contexts/notification-context';

interface NotificationSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NotificationSidebar({ isOpen, onClose }: NotificationSidebarProps) {
  const t = useTranslations('dashboard.notifications');
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification } = useNotifications();

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300';
      case 'warning':
        return 'bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300';
      case 'error':
        return 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300';
      default:
        return 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300';
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/50 z-40 transition-opacity duration-300"
        onClick={onClose}
      />
      
      {/* Sidebar */}
      <div className="fixed right-0 top-0 h-full w-full md:w-[400px] bg-white dark:bg-gray-800 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Bell className="w-5 h-5" />
                {t('title')}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {unreadCount > 0 ? t('unreadCount', { count: unreadCount }) : t('noUnread')}
              </p>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Mark all as read button */}
          {unreadCount > 0 && (
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <Button onClick={markAllAsRead} variant="outline" className="w-full gap-2">
                <Check className="w-4 h-4" />
                {t('markAllAsRead')}
              </Button>
            </div>
          )}

          {/* Notifications List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {notifications.length === 0 ? (
              <div className="text-center py-12">
                <Bell className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600 dark:text-gray-400">{t('noNotifications')}</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <Link 
                  key={notification.id}
                  href={(notification.link || '#') as Route}
                  onClick={onClose}
                  className="block"
                >
                  <Card 
                    className={`dark:bg-gray-700 dark:border-gray-600 border border-gray-200 transition-colors duration-300 hover:shadow-md cursor-pointer ${
                      !notification.read ? 'bg-primary-50 dark:bg-primary-900/20' : ''
                    }`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg ${getTypeColor(notification.type)} flex-shrink-0`}>
                          <Bell className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <h3 className={`font-semibold text-gray-900 dark:text-white text-sm ${
                              !notification.read ? 'text-primary-600 dark:text-primary-400' : ''
                            }`}>
                              {notification.title}
                            </h3>
                            <span className="text-xs text-gray-600 dark:text-gray-400 flex-shrink-0">
                              {notification.date}
                            </span>
                          </div>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                            {notification.message}
                          </p>
                          <div className="flex gap-2">
                            {!notification.read && (
                              <Button 
                                size="sm" 
                                variant="outline" 
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  markAsRead(notification.id);
                                }}
                                className="h-7 text-xs px-2 gap-1"
                              >
                                <Check className="w-3 h-3" />
                                {t('markAsRead')}
                              </Button>
                            )}
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                deleteNotification(notification.id);
                              }}
                              className="h-7 text-xs px-2 gap-1 text-red-600 hover:text-red-700 dark:text-red-400"
                            >
                              <Trash2 className="w-3 h-3" />
                              {t('delete')}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
}
