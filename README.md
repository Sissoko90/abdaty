<div align="center">

# Abdaty Technologie

**Plateforme web bilingue (FR/EN) de l'entreprise Abdaty Technologie** — solutions
digitales : développement web & mobile, UI/UX, cybersécurité, data & IA, et une
**API SMS**. Monorepo **Next.js 16** (frontend) + **Spring Boot 4** réactif (backend),
avec observabilité, sécurité et CI/CD de niveau production.

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-4.0-6DB33F?logo=springboot)
![Java](https://img.shields.io/badge/Java-17-007396?logo=openjdk)
![License](https://img.shields.io/badge/license-Propriétaire-red)

</div>

---

## Table des matières

1. [Présentation](#présentation)
2. [Architecture](#architecture)
3. [Stack technique](#stack-technique)
4. [Fonctionnalités](#fonctionnalités)
5. [Structure du dépôt](#structure-du-dépôt)
6. [Prérequis](#prérequis)
7. [Démarrage rapide (Docker)](#démarrage-rapide-docker)
8. [Développement local](#développement-local)
9. [Variables d'environnement](#variables-denvironnement)
10. [Base de données & migrations](#base-de-données--migrations)
11. [API backend](#api-backend)
12. [Internationalisation](#internationalisation)
13. [Observabilité](#observabilité)
14. [Sécurité](#sécurité)
15. [Intégration continue (CI/CD)](#intégration-continue-cicd)
16. [Tests](#tests)
17. [Licence](#licence)

---

## Présentation

**Abdaty Technologie** est le site institutionnel et la plateforme produit de
l'entreprise (basée au Mali). Il combine :

- un **site vitrine** bilingue (services, blog, FAQ, pages légales) optimisé pour
  le SEO classique **et** la recherche générative / agentique (GEO/AIO) ;
- un **espace client** (dashboard, clés d'API) et une **API SMS** documentée ;
- un **back-office d'administration** complet (CMS, utilisateurs, médias, blog,
  bannières promotionnelles, notifications, métriques) ;
- une **infrastructure d'observabilité et de sécurité** prête pour la production.

Le dépôt est un **monorepo** : `frontend/` (Next.js), `backend/` (Spring Boot),
`observabilite/` (configuration Prometheus/Grafana/Loki), orchestrés par un
`docker-compose.yml` racine.

## Architecture

```
                    ┌──────────────┐         ┌──────────────────────────┐
   Navigateur ────▶ │  Frontend    │ ──────▶ │  Backend  (Spring Boot   │
   (FR / EN)        │  Next.js 16  │  REST   │  WebFlux réactif, JWT)   │
                    │  next-intl   │  /ws    │                          │
                    └──────────────┘         └─────────┬────────────────┘
                                                       │
                  ┌────────────┬───────────────┬───────┼──────────┬───────────┐
                  ▼            ▼               ▼        ▼          ▼           ▼
              PostgreSQL     Redis          Kafka    Vault     Zipkin    Prometheus
              (R2DBC)       (cache)     (push notif) (secrets) (traces)  → Grafana
                                                                          + Loki (logs)
```

- **Frontend** : rendu serveur (App Router), i18n FR/EN, authentification NextAuth,
  proxy/middleware de protection des routes admin.
- **Backend** : entièrement **réactif** (WebFlux + R2DBC), JWT avec refresh tokens,
  Kafka → WebSocket pour les notifications admin temps réel, planificateurs avec
  verrou distribué.
- **Données** : **MySQL** en développement, **PostgreSQL** en production (config
  pilotée par variables d'environnement, jeux de migrations dédiés).

## Stack technique

### Frontend (`frontend/`)

| Domaine            | Technologie                                   |
|--------------------|-----------------------------------------------|
| Framework          | Next.js 16 (App Router, Turbopack)            |
| UI                 | React 19, TypeScript 5                        |
| Style              | Tailwind CSS, shadcn/ui, lucide-react         |
| i18n               | next-intl 4 (FR/EN)                           |
| Authentification   | NextAuth (next-auth 4)                         |
| Qualité            | ESLint 9 (flat config), tsc, parité i18n      |

### Backend (`backend/`)

| Domaine            | Technologie                                          |
|--------------------|------------------------------------------------------|
| Framework          | Spring Boot 4.0 WebFlux (réactif), Java 17           |
| Accès données      | Spring Data R2DBC (MySQL dev / PostgreSQL prod)      |
| Sécurité           | Spring Security, JWT (access + refresh), BCrypt      |
| Messaging          | Spring for Apache Kafka (notifications push)         |
| Cache              | Redis (Lettuce réactif)                              |
| Secrets            | Spring Cloud Vault                                   |
| Observabilité      | Micrometer + Prometheus, tracing Brave/Zipkin        |
| Build              | Maven (wrapper inclus)                               |

### Infrastructure & outillage

Docker / Docker Compose · Prometheus · Grafana · Loki · Promtail · Zipkin ·
HashiCorp Vault · GitHub Actions (CI + scans de sécurité).

## Fonctionnalités

**Public**
- Pages bilingues : accueil, services (+ détail), blog (+ article), à propos,
  contact, FAQ, API SMS (+ docs, plans, swagger), pages légales (CGU, confidentialité, SLA).
- SEO / GEO / AIO : `robots.txt` (crawlers IA autorisés), `/llms.txt`, sitemap,
  données structurées **schema.org** (Organization, WebSite, Service, FAQ, Breadcrumb).
- Formulaire de contact (persistance + emails), newsletter, bannière cookies.

**Espace client**
- Authentification (login, inscription, mot de passe oublié), dashboard,
  gestion de **clés d'API**.

**Back-office d'administration**
- **CMS** unifié (table `site_content`) : hero, navigation, footer, témoignages, SEO…
- Gestion des **utilisateurs** (activation/désactivation, rôles), **blog**, **médias**,
  **documentation**, **bannières promotionnelles** (rotation + planification de campagnes).
- **Notifications push** temps réel (Kafka → WebSocket).
- **Métriques système**, **logs**, **analytics**, **geo-blocking** et suivi des **IP suspectes**.

**Transverses**
- JWT avec refresh tokens, rate limiting par IP/utilisateur, circuit breaker
  (Resilience4j), en-têtes de sécurité, CSP, blocage géographique.

## Structure du dépôt

```
.
├── frontend/            # Application Next.js 16 (App Router, i18n FR/EN)
│   ├── app/[locale]/    #   Routes : about, blog, services, sms-api, dashboard, admin…
│   ├── components/ features/ hooks/ contexts/ lib/ services/ types/
│   ├── i18n/ messages/  #   Configuration et traductions next-intl
│   ├── public/          #   Assets, robots.txt, llms.txt
│   ├── Dockerfile       #   Image standalone multi-stage
│   └── next.config.mjs  #   CSP, headers de sécurité, output standalone
│
├── backend/             # API Spring Boot 4 réactive
│   ├── src/main/java/…  #   Controllers, services, sécurité, schedulers, Kafka
│   ├── src/main/resources/
│   │   ├── application.yml          # Config pilotée par env (DB_VENDOR, etc.)
│   │   └── db/migration/            # Schémas SQL (MySQL + postgresql/)
│   ├── Dockerfile       #   Image JRE multi-stage, utilisateur non-root
│   └── pom.xml
│
├── observabilite/       # Configuration d'observabilité (provisionnée)
│   ├── prometheus.yml
│   ├── provisioning/    #   Datasources, dashboards, alertes Grafana
│   ├── dashboards/      #   Dashboard « Backend — Vue d'ensemble »
│   ├── loki/            #   loki-config + promtail-config
│   └── README.md
│
├── .github/workflows/   # ci.yml (build/lint/test) + security.yml (CodeQL/Trivy/…)
├── docker-compose.yml   # Stack complète (apps + données + observabilité + Vault)
├── .gitleaks.toml
└── LICENSE
```

## Prérequis

- **Docker** & **Docker Compose** (voie recommandée), ou pour le dev natif :
- **Node.js 20.9+** et npm (frontend)
- **JDK 17** (backend ; le wrapper Maven `./mvnw` est inclus)

## Démarrage rapide (Docker)

```bash
# Depuis la racine du dépôt — construit et démarre toute la stack :
docker compose up -d --build
```

| Service     | URL                              |
|-------------|----------------------------------|
| Frontend    | http://localhost:3000            |
| Backend API | http://localhost:8080/api/v1     |
| Grafana     | http://localhost:3002 (admin/admin) |
| Prometheus  | http://localhost:9090            |
| Zipkin      | http://localhost:9411            |

Variante infra seule (pour développer une app sur l'hôte) :

```bash
docker compose up -d postgres redis kafka               # données
docker compose up -d prometheus grafana loki promtail   # observabilité
```

## Développement local

**Frontend**
```bash
cd frontend
npm ci
npm run dev          # http://localhost:3000
```

**Backend**
```bash
cd backend
./mvnw spring-boot:run     # http://localhost:8080  (profil development → MySQL)
```

Scripts frontend utiles : `npm run build`, `npm run lint`, `npm run type-check`,
`npm run i18n:check` (parité des clés FR/EN).

## Variables d'environnement

La configuration est **pilotée par l'environnement** (un seul `application.yml`
côté backend ; le profil vient de `ENVIRONMENT`). Modèles fournis :
`frontend/.env.example` et `backend/.env.example`. Principales variables :

| Variable                 | Rôle                                        | Défaut (dev)       |
|--------------------------|---------------------------------------------|--------------------|
| `ENVIRONMENT`            | Profil Spring (`development`/`production`)   | `development`      |
| `DB_VENDOR`              | `mysql` (dev) / `postgresql` (prod)         | `mysql`            |
| `DB_HOST` `DB_PORT` …    | Connexion base de données                   | localhost:8889     |
| `DB_MIGRATION_PATH`      | Dossier de migrations selon le SGBD         | `db/migration`     |
| `REDIS_HOST` `KAFKA_BROKERS` | Cache & bus d'événements                | localhost          |
| `JWT_*`                  | Clés/durées des tokens                      | —                  |
| `MAIL_*`                 | SMTP (contact, newsletter, alertes Grafana) | —                  |
| `NEXT_PUBLIC_API_URL`    | URL backend pour le frontend                | http://localhost:8080/api/v1 |

> ⚠️ Les secrets ne sont **jamais** versionnés (`.env` ignoré par git, vérifié par
> gitleaks). En production, tous les secrets sont gérés via **Vault** et changés.

## Base de données & migrations

- **Développement** : MySQL. **Production** : PostgreSQL.
- Les schémas vivent dans `backend/src/main/resources/db/migration/` (MySQL) et
  `db/migration/postgresql/` (PostgreSQL, générés via `backend/scripts/mysql_to_postgres.py`).
- Le choix du SGBD et du jeu de migrations est piloté par `DB_VENDOR` et
  `DB_MIGRATION_PATH` — un seul code, deux cibles.

## API backend

Base : `/api/v1`. Principaux contrôleurs :

`Auth` · `User` · `ApiKey` · `BlogPost` · `Contact` · `Newsletter` ·
`SiteContent` · `SiteSetting` · `Media` · `Documentation` · `Notification` ·
`Analytics` · `SystemMetrics` · `Logs` · `GeoBlocking` · `SuspiciousIP` ·
`CookieConsent`.

Endpoints publics : `/auth/**`, `/actuator/health|info|prometheus`, `/uploads/**`,
`/ws/**`. Le reste exige une authentification ; `/admin/**` exige le rôle `ADMIN`.

## Internationalisation

next-intl (FR/EN), routage par préfixe de locale (`/fr`, `/en`) via le middleware
(`frontend/proxy.ts`). Les traductions sont dans `frontend/messages/{fr,en}.json` ;
la parité des clés est vérifiée en CI (`npm run i18n:check`).

## Observabilité

Stack provisionnée dans `observabilite/` (voir [son README](observabilite/README.md)) :

- **Prometheus** scrape `/actuator/prometheus` (métriques Micrometer).
- **Grafana** : dashboard pro (vue d'ensemble, HTTP RED, JVM/CPU/GC, logs) et
  **5 alertes** (backend DOWN, taux 5xx, latence p95, heap, CPU) → email.
- **Loki + Promtail** : agrégation des logs applicatifs.
- **Zipkin** : tracing distribué.

## Sécurité

- **Authentification** : JWT (access + refresh), BCrypt, contrôle de rôle serveur
  (middleware) + client (AuthGuard).
- **Défense applicative** : rate limiting IP/utilisateur, circuit breaker, blocage
  géographique, suivi des IP suspectes, en-têtes de sécurité + **CSP**.
- **Secrets** : Vault, `.env` ignorés par git, scan **gitleaks**.
- **Scans automatisés** (`.github/workflows/security.yml`) : **CodeQL** (Java + JS/TS),
  **Trivy** (dépendances, secrets, IaC ; frontend **et** backend via le fat-jar),
  **npm audit**, **dependency-review**. Exécution sur push/PR + hebdomadaire.

État courant : **0 vulnérabilité** côté frontend et backend après durcissement
(Next 16, overrides postcss/uuid côté front ; netty/jackson/spring-kafka côté back).

## Intégration continue (CI/CD)

Deux workflows GitHub Actions :

- **`ci.yml`** — Frontend (i18n:check, type-check, lint, build) + Backend (tests Maven).
- **`security.yml`** — CodeQL, Trivy (repo + jar backend), gitleaks, npm audit,
  dependency-review.

## Tests

- **Backend** : tests unitaires réactifs (JUnit 5, Mockito, `StepVerifier`) —
  `cd backend && ./mvnw test`.
- **Frontend** : `type-check`, `lint` et parité i18n font office de garde-fous CI.

## Licence

**Propriétaire — © Abdaty Technologie. Tous droits réservés.** Voir [LICENSE](LICENSE).
Ce code est confidentiel ; toute reproduction, distribution ou utilisation non
autorisée est interdite.

---

<div align="center">
Développé avec ❤️ par <b>Abdaty Technologie</b> — Bamako, Mali.
</div>
