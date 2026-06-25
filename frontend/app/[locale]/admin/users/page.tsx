'use client';

import { useCallback, useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { Badge } from '@/components/ui/badge';
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
  const tBreadcrumb = useTranslations('admin.breadcrumb');

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
    const variants: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; label: string }> = {
      active: { variant: 'default', label: t('statusActive') },
      inactive: { variant: 'secondary', label: t('statusInactive') },
      deactivated: { variant: 'secondary', label: t('statusDeactivated') },
      banned: { variant: 'destructive', label: t('statusBanned') },
      blocked: { variant: 'destructive', label: t('statusBlocked') },
    };
    const config = variants[status] || variants.active;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getRoleBadge = (role: string) => {
    const variants: Record<string, { color: string; label: string }> = {
      admin: { color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200', label: 'Admin' },
      moderator: { color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200', label: 'Moderator' },
      user: { color: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200', label: 'User' },
    };
    const config = variants[role] || variants.user;
    return <span className={`px-2 py-1 rounded text-xs font-medium ${config.color}`}>{config.label}</span>;
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumb
          items={[
            { label: tBreadcrumb('dashboard'), href: `/admin` },
            { label: tBreadcrumb('admin'), href: `/admin` },
            { label: t('title') },
          ]}
        />

        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <Users className="w-8 h-8" />
              {t('title')}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">{t('subtitle')}</p>
          </div>
          <Button onClick={() => setCreating({ username: '', email: '', password: '', firstName: '', lastName: '', phoneNumber: '' })} className="gap-2" disabled={!token}>
            <UserPlus className="w-4 h-4" />
            Créer un utilisateur
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{t('totalUsers')}</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{users.length}</p>
                </div>
                <Users className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{t('activeUsers')}</p>
                  <p className="text-2xl font-bold text-green-600">{users.filter(u => u.status === 'active').length}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{t('bannedUsers')}</p>
                  <p className="text-2xl font-bold text-red-600">{users.filter(u => u.status === 'banned').length}</p>
                </div>
                <Ban className="w-8 h-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{t('blockedUsers')}</p>
                  <p className="text-2xl font-bold text-orange-600">{users.filter(u => u.status === 'blocked').length}</p>
                </div>
                <Lock className="w-8 h-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter */}
        <Card className="dark:bg-gray-800 dark:border-gray-700 mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder={t('searchPlaceholder')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="all">{t('allStatus')}</option>
                <option value="active">{t('statusActive')}</option>
                <option value="inactive">{t('statusInactive')}</option>
                <option value="deactivated">{t('statusDeactivated')}</option>
                <option value="banned">{t('statusBanned')}</option>
                <option value="blocked">{t('statusBlocked')}</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 dark:bg-red-950/40 dark:border-red-900 px-4 py-3 text-sm text-red-700 dark:text-red-300">
            {error}
          </div>
        )}

        {/* Users Table */}
        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader>
            <CardTitle>{t('usersList')}</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="py-12 text-center text-gray-500 dark:text-gray-400">Chargement…</div>
            ) : filteredUsers.length === 0 ? (
              <div className="py-12 text-center text-gray-500 dark:text-gray-400">Aucun utilisateur.</div>
            ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">{t('name')}</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">{t('contact')}</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">{t('role')}</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">{t('status')}</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">{t('joined')}</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">{t('actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
                            <span className="text-primary-600 dark:text-primary-400 font-medium">
                              {user.name.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">{user.name}</p>
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              {user.emailVerified ? (
                                <CheckCircle className="w-3 h-3 text-green-500" />
                              ) : (
                                <XCircle className="w-3 h-3 text-red-500" />
                              )}
                              <span>{user.emailVerified ? t('verified') : t('notVerified')}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                            <Mail className="w-3 h-3" />
                            {user.email}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                            <Phone className="w-3 h-3" />
                            {user.phone}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        {getRoleBadge(user.role)}
                      </td>
                      <td className="py-4 px-4">
                        {getStatusBadge(user.status)}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <Calendar className="w-3 h-3" />
                          {user.createdAt}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center justify-end gap-2">
                          {user.status === 'active' && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleToggleStatus(user.id, 'inactive')}
                                className="gap-1"
                              >
                                <XCircle className="w-3 h-3" />
                                {t('deactivate')}
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleBlock(user.id)}
                                className="gap-1"
                              >
                                <Lock className="w-3 h-3" />
                                {t('block')}
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleBan(user.id)}
                                className="gap-1"
                              >
                                <Ban className="w-3 h-3" />
                                {t('ban')}
                              </Button>
                            </>
                          )}
                          {(user.status === 'inactive' || user.status === 'deactivated') && (
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => handleToggleStatus(user.id, 'active')}
                              className="gap-1"
                            >
                              <CheckCircle className="w-3 h-3" />
                              {t('activate')}
                            </Button>
                          )}
                          {user.status === 'banned' && (
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => handleUnban(user.id)}
                              className="gap-1"
                            >
                              <Shield className="w-3 h-3" />
                              {t('unban')}
                            </Button>
                          )}
                          {user.status === 'blocked' && (
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => handleUnblock(user.id)}
                              className="gap-1"
                            >
                              <Unlock className="w-3 h-3" />
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
          </CardContent>
        </Card>
      </div>

      {/* Modale création d'utilisateur */}
      {creating && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setCreating(null)}>
          <Card className="w-full max-w-lg dark:bg-gray-800 dark:border-gray-700" onClick={(e) => e.stopPropagation()}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <UserPlus className="w-5 h-5" /> Nouvel utilisateur
                </CardTitle>
                <Button variant="ghost" size="icon" onClick={() => setCreating(null)}>
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Identifiant *</Label>
                  <Input value={creating.username} onChange={(e) => setCreating({ ...creating, username: e.target.value })} className="mt-1" />
                </div>
                <div>
                  <Label>Email *</Label>
                  <Input type="email" value={creating.email} onChange={(e) => setCreating({ ...creating, email: e.target.value })} className="mt-1" />
                </div>
              </div>
              <div>
                <Label>Mot de passe *</Label>
                <Input type="password" value={creating.password} onChange={(e) => setCreating({ ...creating, password: e.target.value })} className="mt-1" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Prénom</Label>
                  <Input value={creating.firstName} onChange={(e) => setCreating({ ...creating, firstName: e.target.value })} className="mt-1" />
                </div>
                <div>
                  <Label>Nom</Label>
                  <Input value={creating.lastName} onChange={(e) => setCreating({ ...creating, lastName: e.target.value })} className="mt-1" />
                </div>
              </div>
              <div>
                <Label>Téléphone</Label>
                <Input value={creating.phoneNumber} onChange={(e) => setCreating({ ...creating, phoneNumber: e.target.value })} className="mt-1" />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setCreating(null)}>Annuler</Button>
                <Button onClick={handleCreate} disabled={createBusy} className="gap-2">
                  {createBusy ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                  Créer
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
