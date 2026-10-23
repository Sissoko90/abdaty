import { Bricolage_Grotesque, DM_Sans } from 'next/font/google';

/** Polices du site (titres + texte), partagées par le layout localisé et la 404 racine. */
export const displayFont = Bricolage_Grotesque({ subsets: ['latin'], variable: '--font-display', display: 'swap' });
export const sansFont = DM_Sans({ subsets: ['latin'], variable: '--font-sans', display: 'swap' });

/** Classes à poser sur un élément racine pour exposer les variables de police. */
export const fontVariables = `${displayFont.variable} ${sansFont.variable}`;
