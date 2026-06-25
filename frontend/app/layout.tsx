import '@/app/globals.css';
import { NotificationProvider } from '@/contexts/notification-context';
import { AuthSessionProvider } from '@/components/auth-session-provider';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Le SessionProvider enveloppe le NotificationProvider afin que le contexte
  // de notifications puisse accéder à la session (token + utilisateur).
  return (
    <AuthSessionProvider>
      <NotificationProvider>
        {children}
      </NotificationProvider>
    </AuthSessionProvider>
  );
}
