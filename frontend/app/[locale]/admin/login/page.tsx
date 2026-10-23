import { redirect } from 'next/navigation';

/**
 * /admin/login (adresse souvent tapée) : l'accès passe par /login. Une fois connecté,
 * le proxy laisse passer jusqu'ici et on renvoie vers le tableau de bord admin.
 */
export default async function AdminLoginRedirect({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  redirect(`/${locale}/admin`);
}
