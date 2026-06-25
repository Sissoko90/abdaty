// Génère le fichier de seed du contenu éditorial (site_content) à partir des
// fichiers i18n (messages/fr.json, messages/en.json) + quelques valeurs par défaut.
// Sortie : backend/src/main/resources/seed/site-content.json
//
// Usage : node scripts/generate-content-seed.mjs

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const fr = JSON.parse(fs.readFileSync(path.join(root, 'messages/fr.json'), 'utf-8'));
const en = JSON.parse(fs.readFileSync(path.join(root, 'messages/en.json'), 'utf-8'));

const out = [];
const add = (section, contentKey, valueFr, valueEn, contentType = 'text', displayOrder = 0, active = true) =>
  out.push({ section, contentKey, valueFr, valueEn, contentType, displayOrder, active });

/* ----------------------------- HERO ----------------------------- */
add('hero', 'subtitle', fr.hero.subtitle, en.hero.subtitle, 'text', 1);
add('hero', 'title', fr.hero.title, en.hero.title, 'text', 2);
add('hero', 'description', fr.hero.description, en.hero.description, 'text', 3);
add('hero', 'ctaText', fr.hero.cta, en.hero.cta, 'text', 4);
add('hero', 'ctaSecondaryText', fr.hero.ctaSecondary, en.hero.ctaSecondary, 'text', 5);

/* --------------------------- NAVIGATION -------------------------- */
const navItems = [
  ['home', '/'], ['services', '/services'], ['smsApi', '/sms-api'], ['docs', '/docs'],
  ['blog', '/blog'], ['about', '/about'], ['faq', '/faq'], ['contact', '/contact'],
];
navItems.forEach(([key, href], i) => {
  add('navigation', `item-${i + 1}`,
    { label: { fr: fr.nav[key], en: en.nav[key] }, href, isExternal: false },
    { label: { fr: fr.nav[key], en: en.nav[key] }, href, isExternal: false },
    'json', i + 1);
});

/* ----------------------------- FOOTER ---------------------------- */
for (const [i, k] of ['description', 'quickLinks', 'services', 'legal', 'termsOfService', 'privacyPolicy', 'rights'].entries()) {
  add('footer', k, fr.footer[k], en.footer[k], 'text', i + 1);
}

/* --------------------------- NEWSLETTER -------------------------- */
add('newsletter', 'title', fr.newsletter.title, en.newsletter.title, 'text', 1);
add('newsletter', 'description', fr.newsletter.description, en.newsletter.description, 'text', 2);
add('newsletter', 'placeholder', fr.newsletter.placeholder, en.newsletter.placeholder, 'text', 3);
add('newsletter', 'buttonText', fr.newsletter.subscribe, en.newsletter.subscribe, 'text', 4);
add('newsletter', 'successMessage', fr.newsletter.subscribed, en.newsletter.subscribed, 'text', 5);
add('newsletter', 'privacyNote', fr.newsletter.privacy, en.newsletter.privacy, 'text', 6);

/* ----------------------------- CONTACT --------------------------- */
add('contact', 'title', fr.contact.title, en.contact.title, 'text', 1);
add('contact', 'subtitle', fr.contact.subtitle, en.contact.subtitle, 'text', 2);
add('contact', 'description', fr.contact.info.description, en.contact.info.description, 'text', 3);
add('contact', 'email', 'contact@abdatytch.com', 'contact@abdatytch.com', 'text', 4);
add('contact', 'phone', '+223 76 71 41 42', '+223 76 71 41 42', 'text', 5);
add('contact', 'address', 'Bamako, Mali', 'Bamako, Mali', 'text', 6);
add('contact', 'hours', fr.contact.info.hoursValue, en.contact.info.hoursValue, 'text', 7);
add('contact', 'social.facebook', 'https://facebook.com/abdatytechnologie', 'https://facebook.com/abdatytechnologie', 'text', 8);
add('contact', 'social.twitter', 'https://twitter.com/abdatytechnologie', 'https://twitter.com/abdatytechnologie', 'text', 9);
add('contact', 'social.linkedin', 'https://linkedin.com/company/abdatytechnologie', 'https://linkedin.com/company/abdatytechnologie', 'text', 10);
add('contact', 'social.instagram', 'https://instagram.com/abdatytechnologie', 'https://instagram.com/abdatytechnologie', 'text', 11);

/* ------------------------------ ABOUT ---------------------------- */
add('about', 'title', fr.about.title, en.about.title, 'text', 1);
add('about', 'subtitle', fr.about.subtitle, en.about.subtitle, 'text', 2);
add('about', 'description', fr.about.description, en.about.description, 'text', 3);
add('about', 'mission', fr.about.missionText, en.about.missionText, 'text', 4);
add('about', 'vision', fr.about.visionText, en.about.visionText, 'text', 5);

/* ----------------------------- SERVICES -------------------------- */
const serviceDefs = [
  ['web', 'Code', 'web-development'],
  ['mobile', 'Smartphone', 'mobile-apps'],
  ['desktop', 'Monitor', 'desktop-apps'],
  ['design', 'Palette', 'ui-ux-design'],
  ['network', 'Network', 'network-infrastructure'],
  ['security', 'Shield', 'cybersecurity'],
  ['dataAi', 'Brain', 'data-ai'],
];
serviceDefs.forEach(([key, icon, slug], i) => {
  const f = fr.services[key], e = en.services[key];
  if (!f || !e) return;
  add('services', `item-${i + 1}`,
    { icon, slug, title: f.title, subtitle: f.subtitle, description: f.description, features: f.features || [] },
    { title: e.title, subtitle: e.subtitle, description: e.description, features: e.features || [] },
    'json', i + 1);
});

/* --------------------------- TESTIMONIALS ------------------------ */
const testimonials = [
  { clientName: 'Amadou Diallo', company: 'TechSolutions Mali', role: 'CEO', rating: 5,
    fr: 'Abdaty Technologie a transformé notre présence en ligne. Leur équipe professionnelle a livré un projet exceptionnel dans les délais.',
    en: 'Abdaty Technologie transformed our online presence. Their professional team delivered an exceptional project on time.' },
  { clientName: 'Fatoumata Koné', company: 'Mali Digital', role: 'Directrice Marketing', rating: 5,
    fr: "Excellent travail sur notre application mobile. L'équipe est réactive et les résultats dépassent nos attentes.",
    en: 'Excellent work on our mobile app. The team is responsive and the results exceeded our expectations.' },
  { clientName: 'Moussa Touré', company: 'Sahel Tech', role: 'CTO', rating: 4,
    fr: 'Partenaire de confiance pour tous nos projets de développement. Qualité et fiabilité au rendez-vous.',
    en: 'Trusted partner for all our development projects. Quality and reliability guaranteed.' },
];
testimonials.forEach((tt, i) => {
  add('testimonials', `item-${i + 1}`,
    { clientName: tt.clientName, company: tt.company, role: tt.role, rating: tt.rating, content: tt.fr },
    { content: tt.en },
    'json', i + 1);
});

/* ----------------- SOUS-SECTIONS DE LA PAGE À PROPOS ------------- */
const fa = fr.about, ea = en.about;

// about-stats : chiffres (value + libellé + icône)
[
  ['projects', '500+', 'Briefcase'], ['clients', '200+', 'Users'],
  ['awards', '50+', 'Award'], ['countries', '10+', 'Globe'],
].forEach(([key, value, icon], i) => {
  add('about-stats', `item-${i + 1}`,
    { value, label: fa.stats[key], icon },
    { value, label: ea.stats[key], icon },
    'json', i + 1);
});

// about-values : valeurs (icône + titre + description)
[
  ['passion', 'Heart'], ['innovation', 'Lightbulb'],
  ['excellence', 'Target'], ['collaboration', 'Users'],
].forEach(([key, icon], i) => {
  add('about-values', `item-${i + 1}`,
    { icon, title: fa.values[key].title, description: fa.values[key].description },
    { title: ea.values[key].title, description: ea.values[key].description },
    'json', i + 1);
});

// about-timeline : historique (année + titre + description)
[
  ['2020', 'founded'], ['2021', 'firstOffice'], ['2022', 'expansion'],
  ['2023', 'awards'], ['2024', 'international'],
].forEach(([year, key], i) => {
  add('about-timeline', `item-${i + 1}`,
    { year, title: fa.timeline[key].title, description: fa.timeline[key].description },
    { title: ea.timeline[key].title, description: ea.timeline[key].description },
    'json', i + 1);
});

// about-team : équipe (nom/rôle/email/réseaux/photo + bio).
// Photo vide par défaut (initiales affichées) ; à uploader depuis l'admin.
[
  ['ceo', 'Abdoulaye Diarra', 'CEO & Founder', 'abdoulaye@abdaty-tech.com'],
  ['cto', 'Fatoumata Touré', 'CTO', 'fatoumata@abdaty-tech.com'],
  ['leadDev', 'Mamadou Keita', 'Lead Developer', 'mamadou@abdaty-tech.com'],
  ['designer', 'Aminata Coulibaly', 'UI/UX Designer', 'aminata@abdaty-tech.com'],
].forEach(([key, name, role, email], i) => {
  const shared = { name, role, email, image: '', linkedin: '#', github: '#' };
  add('about-team', `item-${i + 1}`,
    { ...shared, bio: fa.team[key].bio },
    { ...shared, bio: ea.team[key].bio },
    'json', i + 1);
});

// about-why : pourquoi nous choisir (icône + titre + description)
[
  ['expertise', 'Award'], ['clientFocused', 'Users'], ['fastDelivery', 'Zap'],
  ['secure', 'Shield'], ['support', 'Clock'], ['scalable', 'TrendingUp'],
].forEach(([key, icon], i) => {
  add('about-why', `item-${i + 1}`,
    { icon, title: fa.whyChooseUs[key].title, description: fa.whyChooseUs[key].description },
    { title: ea.whyChooseUs[key].title, description: ea.whyChooseUs[key].description },
    'json', i + 1);
});

// about-certifications : certifications (icône + badge + titre + description)
[
  ['ssl', 'Shield', 'SSL/TLS'], ['pci', 'Lock', 'PCI-DSS'],
  ['iso', 'Award', 'ISO 27001'], ['gdpr', 'CheckCircle', 'RGPD'],
].forEach(([key, icon, badge], i) => {
  add('about-certifications', `item-${i + 1}`,
    { icon, badge, title: fa.certifications[key].title, description: fa.certifications[key].description },
    { title: ea.certifications[key].title, description: ea.certifications[key].description },
    'json', i + 1);
});

/* ----------------------------- PARTNERS -------------------------- */
// Partenaires affichés dans « Ils nous font confiance » (logo + site).
[
  ['Orange Mali', '/api.png', 'https://orange.ml'],
  ['Moov Africa', '/moov.jpg', 'https://moov-africa.ml'],
  ['Malitel', '/chapchap.png', 'https://malitel.ml'],
  ['Bank of Africa', '/aua.jpg', '#'],
  ['Ecobank', '/ecobank.png', 'https://ecobank.com'],
].forEach(([name, logo, website], i) => {
  add('partners', `item-${i + 1}`, { name, logo, website }, { name, logo, website }, 'json', i + 1);
});

/* ------------------------------ STATS ---------------------------- */
// Chiffres clés du site (gérables) : value + libellé bilingue.
const stats = [
  { value: '500+', fr: 'Projets Livrés', en: 'Projects Delivered' },
  { value: '200+', fr: 'Clients Satisfaits', en: 'Satisfied Clients' },
  { value: '99%', fr: 'Taux de Satisfaction', en: 'Satisfaction Rate' },
  { value: '24/7', fr: 'Support Disponible', en: 'Support Available' },
  { value: '10+', fr: "Ans d'Expérience", en: 'Years Experience' },
  { value: '50+', fr: 'Récompenses', en: 'Awards' },
];
stats.forEach((s, i) => {
  add('stats', `item-${i + 1}`,
    { value: s.value, label: s.fr },
    { value: s.value, label: s.en },
    'json', i + 1);
});

/* ------------------------------- FAQ ----------------------------- */
let faqOrder = 0;
for (const cat of ['general', 'services', 'pricing', 'technical', 'contact']) {
  const fcat = fr.faq[cat], ecat = en.faq[cat];
  if (!fcat) continue;
  for (const k of Object.keys(fcat)) {
    const item = fcat[k];
    if (item && typeof item === 'object' && item.question && item.answer) {
      faqOrder += 1;
      add('faq', `item-${faqOrder}`,
        { question: item.question, answer: item.answer, category: cat },
        { question: ecat?.[k]?.question ?? item.question, answer: ecat?.[k]?.answer ?? item.answer },
        'json', faqOrder);
    }
  }
}

/* ----------------------------- ÉCRITURE -------------------------- */
const dest = path.join(root, 'backend/src/main/resources/seed/site-content.json');
fs.mkdirSync(path.dirname(dest), { recursive: true });
fs.writeFileSync(dest, JSON.stringify(out, null, 2), 'utf-8');
console.log(`✅ ${out.length} blocs écrits → ${dest}`);
const bySection = out.reduce((a, b) => ((a[b.section] = (a[b.section] || 0) + 1), a), {});
console.log('Par section:', bySection);
