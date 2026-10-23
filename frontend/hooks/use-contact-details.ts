import { usePublicSection } from '@/hooks/use-public-content';

/** Coordonnées par défaut (repli si la section "contact" de l'admin est vide). */
const DEFAULTS = {
  email: 'contact@abdatytch.com',
  phone: '+223 76 71 41 42',
  address: 'Hamdallaye, Bamako, Mali',
};

/**
 * Coordonnées publiques gérées dans l'admin (section "contact"), partagées par
 * le footer et le bloc d'appel à l'action pour afficher partout les mêmes infos.
 */
export function useContactDetails() {
  const { cv } = usePublicSection('contact');
  const email = cv('email', DEFAULTS.email);
  const phone = cv('phone', DEFAULTS.phone);
  const address = cv('address', DEFAULTS.address);
  return {
    email,
    phone,
    address,
    emailHref: `mailto:${email}`,
    phoneHref: `tel:${phone.replace(/[^\d+]/g, '')}`,
  };
}
