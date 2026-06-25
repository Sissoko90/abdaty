/**
 * Référentiel pays (ISO 3166-1 alpha-2) pour le blocage géographique.
 * Liste complète des États reconnus (~197), avec nom FR et continent.
 * Le drapeau est dérivé du code via `flagFromCode`.
 */

export interface Country {
  code: string;
  name: string;
  continentCode: string;
  continentName: string;
}

const AF = ['AF', 'Afrique'];
const EU = ['EU', 'Europe'];
const NA = ['NA', 'Amérique du Nord'];
const SA = ['SA', 'Amérique du Sud'];
const AS = ['AS', 'Asie'];
const OC = ['OC', 'Océanie'];

const C = (code: string, name: string, cont: string[]): Country => ({
  code,
  name,
  continentCode: cont[0],
  continentName: cont[1],
});

/** Liste complète des pays gérables. */
export const COUNTRIES: Country[] = [
  // ---------------- Afrique (54) ----------------
  C('DZ', 'Algérie', AF), C('AO', 'Angola', AF), C('BJ', 'Bénin', AF), C('BW', 'Botswana', AF),
  C('BF', 'Burkina Faso', AF), C('BI', 'Burundi', AF), C('CM', 'Cameroun', AF), C('CV', 'Cap-Vert', AF),
  C('CF', 'Centrafrique', AF), C('TD', 'Tchad', AF), C('KM', 'Comores', AF), C('CG', 'Congo', AF),
  C('CD', 'RD Congo', AF), C('CI', "Côte d'Ivoire", AF), C('DJ', 'Djibouti', AF), C('EG', 'Égypte', AF),
  C('GQ', 'Guinée équatoriale', AF), C('ER', 'Érythrée', AF), C('SZ', 'Eswatini', AF), C('ET', 'Éthiopie', AF),
  C('GA', 'Gabon', AF), C('GM', 'Gambie', AF), C('GH', 'Ghana', AF), C('GN', 'Guinée', AF),
  C('GW', 'Guinée-Bissau', AF), C('KE', 'Kenya', AF), C('LS', 'Lesotho', AF), C('LR', 'Liberia', AF),
  C('LY', 'Libye', AF), C('MG', 'Madagascar', AF), C('MW', 'Malawi', AF), C('ML', 'Mali', AF),
  C('MR', 'Mauritanie', AF), C('MU', 'Maurice', AF), C('MA', 'Maroc', AF), C('MZ', 'Mozambique', AF),
  C('NA', 'Namibie', AF), C('NE', 'Niger', AF), C('NG', 'Nigeria', AF), C('RW', 'Rwanda', AF),
  C('ST', 'Sao Tomé-et-Principe', AF), C('SN', 'Sénégal', AF), C('SC', 'Seychelles', AF), C('SL', 'Sierra Leone', AF),
  C('SO', 'Somalie', AF), C('ZA', 'Afrique du Sud', AF), C('SS', 'Soudan du Sud', AF), C('SD', 'Soudan', AF),
  C('TZ', 'Tanzanie', AF), C('TG', 'Togo', AF), C('TN', 'Tunisie', AF), C('UG', 'Ouganda', AF),
  C('ZM', 'Zambie', AF), C('ZW', 'Zimbabwe', AF),

  // ---------------- Europe (46) ----------------
  C('AL', 'Albanie', EU), C('AD', 'Andorre', EU), C('AT', 'Autriche', EU), C('BY', 'Biélorussie', EU),
  C('BE', 'Belgique', EU), C('BA', 'Bosnie-Herzégovine', EU), C('BG', 'Bulgarie', EU), C('HR', 'Croatie', EU),
  C('CY', 'Chypre', EU), C('CZ', 'Tchéquie', EU), C('DK', 'Danemark', EU), C('EE', 'Estonie', EU),
  C('FI', 'Finlande', EU), C('FR', 'France', EU), C('DE', 'Allemagne', EU), C('GR', 'Grèce', EU),
  C('HU', 'Hongrie', EU), C('IS', 'Islande', EU), C('IE', 'Irlande', EU), C('IT', 'Italie', EU),
  C('XK', 'Kosovo', EU), C('LV', 'Lettonie', EU), C('LI', 'Liechtenstein', EU), C('LT', 'Lituanie', EU),
  C('LU', 'Luxembourg', EU), C('MT', 'Malte', EU), C('MD', 'Moldavie', EU), C('MC', 'Monaco', EU),
  C('ME', 'Monténégro', EU), C('NL', 'Pays-Bas', EU), C('MK', 'Macédoine du Nord', EU), C('NO', 'Norvège', EU),
  C('PL', 'Pologne', EU), C('PT', 'Portugal', EU), C('RO', 'Roumanie', EU), C('RU', 'Russie', EU),
  C('SM', 'Saint-Marin', EU), C('RS', 'Serbie', EU), C('SK', 'Slovaquie', EU), C('SI', 'Slovénie', EU),
  C('ES', 'Espagne', EU), C('SE', 'Suède', EU), C('CH', 'Suisse', EU), C('UA', 'Ukraine', EU),
  C('GB', 'Royaume-Uni', EU), C('VA', 'Vatican', EU),

  // ---------------- Asie (48) ----------------
  C('AF', 'Afghanistan', AS), C('AM', 'Arménie', AS), C('AZ', 'Azerbaïdjan', AS), C('BH', 'Bahreïn', AS),
  C('BD', 'Bangladesh', AS), C('BT', 'Bhoutan', AS), C('BN', 'Brunei', AS), C('KH', 'Cambodge', AS),
  C('CN', 'Chine', AS), C('GE', 'Géorgie', AS), C('IN', 'Inde', AS), C('ID', 'Indonésie', AS),
  C('IR', 'Iran', AS), C('IQ', 'Irak', AS), C('IL', 'Israël', AS), C('JP', 'Japon', AS),
  C('JO', 'Jordanie', AS), C('KZ', 'Kazakhstan', AS), C('KW', 'Koweït', AS), C('KG', 'Kirghizistan', AS),
  C('LA', 'Laos', AS), C('LB', 'Liban', AS), C('MY', 'Malaisie', AS), C('MV', 'Maldives', AS),
  C('MN', 'Mongolie', AS), C('MM', 'Myanmar', AS), C('NP', 'Népal', AS), C('KP', 'Corée du Nord', AS),
  C('OM', 'Oman', AS), C('PK', 'Pakistan', AS), C('PS', 'Palestine', AS), C('PH', 'Philippines', AS),
  C('QA', 'Qatar', AS), C('SA', 'Arabie saoudite', AS), C('SG', 'Singapour', AS), C('KR', 'Corée du Sud', AS),
  C('LK', 'Sri Lanka', AS), C('SY', 'Syrie', AS), C('TW', 'Taïwan', AS), C('TJ', 'Tadjikistan', AS),
  C('TH', 'Thaïlande', AS), C('TL', 'Timor oriental', AS), C('TR', 'Turquie', AS), C('TM', 'Turkménistan', AS),
  C('AE', 'Émirats arabes unis', AS), C('UZ', 'Ouzbékistan', AS), C('VN', 'Vietnam', AS), C('YE', 'Yémen', AS),

  // ---------------- Amérique du Nord & Centrale, Caraïbes (23) ----------------
  C('AG', 'Antigua-et-Barbuda', NA), C('BS', 'Bahamas', NA), C('BB', 'Barbade', NA), C('BZ', 'Belize', NA),
  C('CA', 'Canada', NA), C('CR', 'Costa Rica', NA), C('CU', 'Cuba', NA), C('DM', 'Dominique', NA),
  C('DO', 'Rép. dominicaine', NA), C('SV', 'Salvador', NA), C('GD', 'Grenade', NA), C('GT', 'Guatemala', NA),
  C('HT', 'Haïti', NA), C('HN', 'Honduras', NA), C('JM', 'Jamaïque', NA), C('MX', 'Mexique', NA),
  C('NI', 'Nicaragua', NA), C('PA', 'Panama', NA), C('KN', 'Saint-Kitts-et-Nevis', NA), C('LC', 'Sainte-Lucie', NA),
  C('VC', 'Saint-Vincent-et-les-Grenadines', NA), C('TT', 'Trinité-et-Tobago', NA), C('US', 'États-Unis', NA),

  // ---------------- Amérique du Sud (12) ----------------
  C('AR', 'Argentine', SA), C('BO', 'Bolivie', SA), C('BR', 'Brésil', SA), C('CL', 'Chili', SA),
  C('CO', 'Colombie', SA), C('EC', 'Équateur', SA), C('GY', 'Guyana', SA), C('PY', 'Paraguay', SA),
  C('PE', 'Pérou', SA), C('SR', 'Suriname', SA), C('UY', 'Uruguay', SA), C('VE', 'Venezuela', SA),

  // ---------------- Océanie (14) ----------------
  C('AU', 'Australie', OC), C('FJ', 'Fidji', OC), C('KI', 'Kiribati', OC), C('MH', 'Îles Marshall', OC),
  C('FM', 'Micronésie', OC), C('NR', 'Nauru', OC), C('NZ', 'Nouvelle-Zélande', OC), C('PW', 'Palaos', OC),
  C('PG', 'Papouasie-Nouvelle-Guinée', OC), C('WS', 'Samoa', OC), C('SB', 'Îles Salomon', OC), C('TO', 'Tonga', OC),
  C('TV', 'Tuvalu', OC), C('VU', 'Vanuatu', OC),

  // ---------------- Territoires & dépendances (routage IP propre) ----------------
  // Europe
  C('AX', 'Åland', EU), C('FO', 'Îles Féroé', EU), C('GI', 'Gibraltar', EU), C('GG', 'Guernesey', EU),
  C('JE', 'Jersey', EU), C('IM', 'Île de Man', EU), C('SJ', 'Svalbard et Jan Mayen', EU),
  // Afrique
  C('RE', 'Réunion', AF), C('YT', 'Mayotte', AF), C('SH', 'Sainte-Hélène', AF), C('EH', 'Sahara occidental', AF),
  // Asie
  C('HK', 'Hong Kong', AS), C('MO', 'Macao', AS), C('IO', "Territoire britannique de l'océan Indien", AS),
  // Amérique du Nord & Caraïbes
  C('AI', 'Anguilla', NA), C('AW', 'Aruba', NA), C('BM', 'Bermudes', NA), C('VG', 'Îles Vierges britanniques', NA),
  C('KY', 'Îles Caïmans', NA), C('CW', 'Curaçao', NA), C('GP', 'Guadeloupe', NA), C('MQ', 'Martinique', NA),
  C('MS', 'Montserrat', NA), C('PR', 'Porto Rico', NA), C('BL', 'Saint-Barthélemy', NA), C('MF', 'Saint-Martin', NA),
  C('PM', 'Saint-Pierre-et-Miquelon', NA), C('SX', 'Sint Maarten', NA), C('TC', 'Îles Turques-et-Caïques', NA),
  C('VI', 'Îles Vierges américaines', NA), C('BQ', 'Pays-Bas caribéens', NA), C('GL', 'Groenland', NA),
  // Amérique du Sud
  C('GF', 'Guyane française', SA), C('FK', 'Îles Malouines', SA),
  // Océanie
  C('AS', 'Samoa américaines', OC), C('CK', 'Îles Cook', OC), C('PF', 'Polynésie française', OC), C('GU', 'Guam', OC),
  C('MP', 'Îles Mariannes du Nord', OC), C('NC', 'Nouvelle-Calédonie', OC), C('NU', 'Niue', OC), C('NF', 'Île Norfolk', OC),
  C('PN', 'Pitcairn', OC), C('TK', 'Tokelau', OC), C('WF', 'Wallis-et-Futuna', OC), C('CX', 'Île Christmas', OC),
  C('CC', 'Îles Cocos', OC),
];

/** Index par code pour enrichir l'affichage des règles. */
export const COUNTRY_BY_CODE: Record<string, Country> = Object.fromEntries(
  COUNTRIES.map((c) => [c.code, c])
);

/** Émoji drapeau dérivé d'un code ISO 3166-1 alpha-2. */
export function flagFromCode(code?: string): string {
  if (!code || code.length !== 2) return '🌐';
  try {
    return String.fromCodePoint(...[...code.toUpperCase()].map((c) => 127397 + c.charCodeAt(0)));
  } catch {
    return '🌐';
  }
}
