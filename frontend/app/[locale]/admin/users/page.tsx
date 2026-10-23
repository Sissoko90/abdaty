'use client';

import { useCallback, useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge, type BadgeProps } from '@/components/ui/badge';
import { AdminPage, AdminPageHeader, AdminStatCard } from '@/components/admin/admin-page';
import { listUsers, setUserStatus, createUser, type BackendUser, type CreateUserInput } from '@/services/user.service';
import { ApiRequestError } from '@/lib/api';
import { 
  Users, 
  Search, 
  Ban, 
  CheckCircle, 
  XCircle, 
  Lock, 
  Unlock,
  Shield,
  Mail,
  Phone,
  Calendar,
  UserPlus,
  X,
  Loader2,
  AlertCircle,
} from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'user' | 'admin' | 'moderator';
  status: 'active' | 'inactive' | 'deactivated' | 'banned' | 'blocked';
  emailVerified: boolean;
  createdAt: string;
  lastLogin: string;
}

export default function AdminUsersPage() {
  const t = useTranslations('admin.users');

  const { data: session } = useSession();
  const token = session?.accessToken;

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [creating, setCreating] = useState<CreateUserInput | null>(null);
  const [createBusy, setCreateBusy] = useState(false);

  /** Crée un nouvel utilisateur via le backend. */
  const handleCreate = async () => {
    if (!token || !creating) return;
    if (!creating.username.trim() || !creating.email.trim() || !creating.password.trim()) {
      setError('Identifiant, email et mot de passe sont requis.');
      return;
    }
    setCreateBusy(true);
    setError('');
    try {
      await createUser(token, creating);
      setCreating(null);
      reload();
    } catch (e) {
      setError(e instanceof ApiRequestError ? e.message : "Création de l'utilisateur impossible.");
    } finally {
      setCreateBusy(false);
    }
  };

  /** Convertit un utilisateur backend vers le modèle d'affichage. */
  const mapUser = (u: BackendUser): User => {
    const name = [u.firstName, u.lastName].filter(Boolean).join(' ') || u.username || u.email;
    const role = (u.role || 'user').toLowerCase();
    return {
      id: u.id,
      name,
      email: u.email,
      phone: u.phoneNumber || '',
      role: (['admin', 'moderator', 'user'].includes(role) ? role : 'user') as User['role'],
      status: ((u.status || 'ACTIVE').toLowerCase()) as User['status'],
      emailVerified: true,
      createdAt: u.createdAt ? u.createdAt.slice(0, 10) : '',
      lastLogin: '',
    };
  };

  const reload = useCallback(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError('');
    listUsers(token)
      .then((list) => setUsers(list.map(mapUser)))
      .catch((e) => setError(e instanceof ApiRequestError ? e.message : 'Erreur de chargement.'))
      .finally(() => setLoading(false));
  }, [token]);

  useEffect(() => {
    reload();
  }, [reload]);

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || user.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  /** Applique une action de statut sur le backend puis recharge. */
  const applyStatus = async (
    userId: string,
    action: 'activate' | 'deactivate' | 'ban' | 'unban' | 'block' | 'unblock'
  ) => {
    if (!token) return;
    try {
      await setUserStatus(token, userId, action);
      reload();
    } catch (e) {
      setError(e instanceof ApiRequestError ? e.message : 'Action impossible.');
    }
  };

  const handleToggleStatus = (userId: string, newStatus: 'active' | 'inactive') =>
    applyStatus(userId, newStatus === 'active' ? 'activate' : 'deactivate');

  const handleBan = (userId: string) => {
    if (confirm(t('confirmBan'))) applyStatus(userId, 'ban');
  };

  const handleUnban = (userId: string) => applyStatus(userId, 'unban');

  const handleBlock = (userId: string) => {
    if (confirm(t('confirmBlock'))) applyStatus(userId, 'block');
  };

  const handleUnblock = (userId: string) => applyStatus(userId, 'unblock');

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: NonNullable<BadgeProps['variant']>; label: string }> = {
      active: { variant: 'success', label: t('statusActive') },
      inactive: { variant: 'secondary', label: t('statusInactive') },
      deactivated: { variant: 'secondary', label: t('statusDeactivated') },
      banned: { variant: 'destructive', label: t('statusBanned') },
      blocked: { variant: 'warning', label: t('statusBlocked') },
    };
    const config = variants[status] || variants.active;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getRoleBadge = (role: string) => {
    const variants: Record<string, { color: string; label: string }> = {
      admin: { color: 'bg-ink text-white dark:bg-white dark:text-ink', label: 'Admin' },
      moderator: { color: 'bg-ochre/20 text-amber-800 dark:text-ochre', label: 'Moderator' },
      user: { color: 'bg-gray-100 text-gray-700 dark:bg-white/10 dark:text-gray-300', label: 'User' },
    };
    const config = variants[role] || variants.user;
    return <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${config.color}`}>{config.label}</span>;
  };

  return (
    <>
      <AdminPage>
        <AdminPageHeader
          title={t('title')}
          description={t('subtitle')}
          icon={Users}
          actions={
            <Button
              onClick={() => setCreating({ username: '', email: '', password: '', firstName: '', lastName: '', phoneNumber: '' })}
              className="gap-2"
              disabled={!token}
            >
              <UserPlus className="h-4 w-4" />
              Créer un utilisateur
            </Button>
          }
        />

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <AdminStatCard label={t('totalUsers')} value={users.length} icon={Users} />
          <AdminStatCard label={t('activeUsers')} value={users.filter((u) => u.status === 'active').length} icon={CheckCircle} tone="emerald" />
          <AdminStatCard label={t('bannedUsers')} value={users.filter((u) => u.status === 'banned').length} icon={Ban} tone="ink" />
          <AdminStatCard label={t('blockedUsers')} value={users.filter((u) => u.status === 'blocked').length} icon={Lock} tone="ochre" />
        </div>

        {error && (
          <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        {/* Users Table */}
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-white/10 dark:bg-white/[0.03]">
          <div className="flex flex-col gap-4 border-b border-gray-100 p-5 dark:border-white/10 md:flex-row md:items-center md:justify-between">
            <h2 className="text-lg font-bold text-ink dark:text-white">{t('usersList')}</h2>
            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative sm:w-72">
                <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder={t('searchPlaceholder')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                  aria-label={t('searchPlaceholder')}
                />
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                aria-label={t('status')}
                className="h-11 rounded-xl border border-gray-300 bg-white px-3.5 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-white/15 dark:bg-white/5 dark:text-white"
              >
                <option value="all">{t('allStatus')}</option>
                <option value="active">{t('statusActive')}</option>
                <option value="inactive">{t('statusInactive')}</option>
                <option value="deactivated">{t('statusDeactivated')}</option>
                <option value="banned">{t('statusBanned')}</option>
                <option value="blocked">{t('statusBlocked')}</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-14 text-gray-500 dark:text-gray-400">
              <Loader2 className="mr-2 h-5 w-5 animate-spin text-primary-600" /> Chargement…
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="px-6 py-14 text-center">
              <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-50 text-primary-600 dark:bg-primary-500/10 dark:text-primary-400">
                <Users className="h-6 w-6" />
              </span>
              <p className="text-gray-600 dark:text-gray-400">{users.length === 0 ? 'Aucun utilisateur.' : t('noResults')}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 text-left text-xs font-semibold text-gray-500 dark:bg-white/[0.03] dark:text-gray-400">
                    <th className="h-11 px-5">{t('name')}</th>
                    <th className="h-11 px-5">{t('contact')}</th>
                    <th className="h-11 px-5">{t('role')}</th>
                    <th className="h-11 px-5">{t('status')}</th>
                    <th className="h-11 px-5">{t('joined')}</th>
                    <th className="h-11 px-5 text-right">{t('actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="border-b border-gray-100 transition-colors last:border-0 hover:bg-gray-50/70 dark:border-white/5 dark:hover:bg-white/[0.03]">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-50 font-semibold text-primary-700 dark:bg-primary-500/15 dark:text-primary-300">
                            {user.name.charAt(0).toUpperCase()}
                          </span>
                          <div>
                            <p className="font-medium text-ink dark:text-white">{user.name}</p>
                            <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                              {user.emailVerified ? (
                                <CheckCircle className="h-3 w-3 text-emerald-500" />
                              ) : (
                                <XCircle className="h-3 w-3 text-red-500" />
                              )}
                              <span>{user.emailVerified ? t('verified') : t('notVerified')}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                          <div className="flex items-center gap-2">
                            <Mail className="h-3.5 w-3.5 text-gray-400" />
                            {user.email}
                          </div>
                          {user.phone && (
                            <div className="flex items-center gap-2">
                              <Phone className="h-3.5 w-3.5 text-gray-400" />
                              {user.phone}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-4">{getRoleBadge(user.role)}</td>
                      <td className="px-5 py-4">{getStatusBadge(user.status)}</td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <Calendar className="h-3.5 w-3.5 text-gray-400" />
                          {user.createdAt}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-2">
                          {user.status === 'active' && (
                            <>
                              <Button variant="outline" size="sm" onClick={() => handleToggleStatus(user.id, 'inactive')} className="gap-1">
                                <XCircle className="h-3.5 w-3.5" />
                                {t('deactivate')}
                              </Button>
                              <Button variant="outline" size="sm" onClick={() => handleBlock(user.id)} className="gap-1">
                                <Lock className="h-3.5 w-3.5" />
                                {t('block')}
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleBan(user.id)}
                                className="gap-1 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 dark:border-red-500/30 dark:text-red-400 dark:hover:bg-red-500/10"
                              >
                                <Ban className="h-3.5 w-3.5" />
                                {t('ban')}
                              </Button>
                            </>
                          )}
                          {(user.status === 'inactive' || user.status === 'deactivated') && (
                            <Button variant="default" size="sm" onClick={() => handleToggleStatus(user.id, 'active')} className="gap-1">
                              <CheckCircle className="h-3.5 w-3.5" />
                              {t('activate')}
                            </Button>
                          )}
                          {user.status === 'banned' && (
                            <Button variant="default" size="sm" onClick={() => handleUnban(user.id)} className="gap-1">
                              <Shield className="h-3.5 w-3.5" />
                              {t('unban')}
                            </Button>
                          )}
                          {user.status === 'blocked' && (
                            <Button variant="default" size="sm" onClick={() => handleUnblock(user.id)} className="gap-1">
                              <Unlock className="h-3.5 w-3.5" />
                              {t('unblock')}
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </AdminPage>

      {/* Modale création d'utilisateur */}
      {creating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 p-4 backdrop-blur-sm" onClick={() => setCreating(null)}>
          <Card className="w-full max-w-lg shadow-2xl shadow-ink/20 dark:bg-[#121c2e]" onClick={(e) => e.stopPropagation()}>
            <CardHeader className="border-b border-gray-100 dark:border-white/10">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 text-primary-600 dark:bg-primary-500/10 dark:text-primary-400">
                    <UserPlus className="h-5 w-5" />
                  </span>
                  Nouvel utilisateur
                </CardTitle>
                <Button variant="ghost" size="icon" onClick={() => setCreating(null)} aria-label="Fermer">
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-5 pt-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Identifiant *</Label>
                  <Input value={creating.username} onChange={(e) => setCreating({ ...creating, username: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Email *</Label>
                  <Input type="email" value={creating.email} onChange={(e) => setCreating({ ...creating, email: e.target.value })} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Mot de passe *</Label>
                <Input type="password" value={creating.password} onChange={(e) => setCreating({ ...creating, password: e.target.value })} />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Prénom</Label>
                  <Input value={creating.firstName} onChange={(e) => setCreating({ ...creating, firstName: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Nom</Label>
                  <Input value={creating.lastName} onChange={(e) => setCreating({ ...creating, lastName: e.target.value })} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Téléphone</Label>
                <Input value={creating.phoneNumber} onChange={(e) => setCreating({ ...creating, phoneNumber: e.target.value })} />
              </div>
              <div className="flex justify-end gap-2 border-t border-gray-100 pt-5 dark:border-white/10">
                <Button variant="outline" onClick={() => setCreating(null)}>Annuler</Button>
                <Button onClick={handleCreate} disabled={createBusy} className="gap-2">
                  {createBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
                  Créer
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}
