# Abdaty Backend

Backend réactif Spring WebFlux avec authentification JWT RSA, sécurité avancée et monitoring.

## 📋 Table des matières

- [Architecture](#architecture)
- [Configuration](#configuration)
- [Sécurité](#sécurité)
- [Controllers](#controllers)
- [Services](#services)
- [Filtres de Sécurité](#filtres-de-sécurité)
- [Base de Données](#base-de-données)
- [Démarrage](#démarrage)
- [API Documentation](#api-documentation)

---

## Architecture

### Stack Technique

- **Framework**: Spring Boot 4.0.6
- **Java Version**: 17
- **Programmation Réactive**: Spring WebFlux + Project Reactor
- **Base de Données**: MySQL avec R2DBC (réactif)
- **Cache**: Redis (réactif)
- **Messaging**: Apache Kafka
- **Monitoring**: Micrometer + Prometheus + Zipkin
- **API Documentation**: SpringDoc OpenAPI (Swagger)
- **Sécurité**: Spring Security avec JWT RSA
- **Résilience**: Resilience4j (Circuit Breaker + Retry)

### Structure du Projet

```
backend/
├── src/main/java/com/abdatytch/backend/
│   ├── config/              # Configuration Spring
│   ├── constants/           # Constantes de l'application
│   ├── controlleur/         # REST Controllers
│   ├── dto/                 # Data Transfer Objects
│   ├── entity/              # Entités JPA/R2DBC
│   ├── mapper/              # Mappeurs DTO ↔ Entity
│   ├── repository/          # Repositories R2DBC
│   ├── security/            # Configuration de sécurité
│   │   ├── filter/          # Filtres de sécurité
│   │   ├── rsa/             # Service RSA pour JWT
│   │   └── AuthenticationManager.java
│   ├── service/             # Services métier
│   │   └── impl/            # Implémentations
│   └── seeder/              # Seeders de données initiales
└── src/main/resources/
    ├── application.yml      # Configuration Spring
    └── .env                 # Variables d'environnement
```

---

## Configuration

### Variables d'Environnement (.env)

```bash
# Configuration de l'application
ENVIRONMENT=development
APP_NAME=Abdaty Backend
SERVER_PORT=8080

# Base de données MySQL
DB_HOST=localhost
DB_PORT=8889
DB_NAME=abdatydb
DB_USERNAME=root
DB_PASSWORD=root

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# Kafka
KAFKA_BROKERS=localhost:9092

# Email
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=makenzyks6@gmail.com
MAIL_PASSWORD=dtas yfru noki bdaa

# JWT avec RSA
JWT_EXPIRATION=86400000              # 24 heures
JWT_REFRESH_EXPIRATION=604800000     # 7 jours
JWT_RSA_KEY_SIZE=2048
JWT_RSA_ROTATION_ENABLED=true
JWT_RSA_ROTATION_INTERVAL_DAYS=30

# Admin par défaut
ADMIN_USERNAME=admin
ADMIN_EMAIL=admin@abdatytch.com
ADMIN_PASSWORD=Admin@123
ADMIN_SEEDER_ENABLED=true

# Sécurité
CORS_ENABLED=true
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
RATE_LIMIT_ENABLED=true
RATE_LIMIT_REQUESTS_PER_MINUTE=100
IP_BLACKLIST_ENABLED=true
CSRF_ENABLED=true
SECURITY_HEADERS_ENABLED=true
```

---

## Sécurité

### JWT RSA avec Rotation de Clé

#### RsaKeyService

Service de gestion des clés RSA avec rotation automatique.

**Méthodes principales:**

- `generateNewKeyPair()`: Génère une nouvelle paire de clés RSA (2048 bits)
- `isRotationNeeded()`: Vérifie si une rotation est nécessaire (30 jours par défaut)
- `rotateIfNeeded()`: Effectue la rotation si nécessaire
- `getCurrentKeyPair()`: Retourne la paire de clés actuelle
- `getPreviousKeyPair()`: Retourne la paire de clés précédente (pour transition)
- `getPublicKey()`: Retourne la clé publique en Base64
- `getPrivateKey()`: Retourne la clé privée en Base64

**Configuration:**
```yaml
jwt:
  rsa:
    key-size: 2048
    rotation:
      enabled: true
      interval-days: 30
```

#### JwtService

Service de génération et validation des tokens JWT avec signature RSA.

**Méthodes:**
- `generateAccessToken(userId, email, role)`: Génère un token d'accès
- `generateRefreshToken(userId, email)`: Génère un token de rafraîchissement
- `extractEmail(token)`: Extrait l'email du token
- `extractUserId(token)`: Extrait l'ID utilisateur
- `extractRole(token)`: Extrait le rôle
- `validateToken(token)`: Valide le token avec support de rotation de clé
- `isTokenExpired(token)`: Vérifie si le token est expiré

**Caractéristiques:**
- Signature RSA avec clé privée
- Validation avec clé publique
- Support de rotation de clé (validation avec clé actuelle et précédente)
- Circuit Breaker et Retry pour résilience

#### AuthenticationManager

Manager d'authentification réactif utilisant IJwtService.

**Méthode:**
- `authenticate(Authentication)`: Valide le token JWT et extrait les informations

#### SecurityContextRepository

Repository de contexte de sécurité pour WebFlux.

**Méthode:**
- `load(ServerWebExchange)`: Charge le contexte de sécurité depuis le header Authorization

---

## Filtres de Sécurité

### 1. SecurityFilter

Filtre principal de sécurité intégrant:
- Vérification dynamique d'IP blacklist (via SuspiciousIPRepository)
- Protection contre path traversal
- Protection contre XSS
- Protection contre SQL injection

### 2. RateLimitFilter

Filtre de rate limiting par IP utilisant Redis.

**Configuration:**
```yaml
rate-limit:
  enabled: true
  requests-per-minute: 100
  requests-per-hour: 1000
  requests-per-day: 10000
```

### 3. SecurityHeadersFilter

Ajoute les headers de sécurité HTTP:
- HSTS (HTTP Strict Transport Security)
- CSP (Content Security Policy)
- X-Frame-Options
- X-Content-Type-Options
- X-XSS-Protection

### 4. InputValidationFilter

Valide et nettoie les inputs:
- Validation de la longueur maximale
- Nettoyage des caractères de contrôle
- Protection contre XSS

### 5. CsrfFilter

Filtre CSRF avec configuration conditionnelle.

### 6. DDoSProtectionService

Service de protection DDoS avec Circuit Breaker.

---

## Controllers

### 1. AuthController

**Base URL:** `/api/v1/auth`

**Endpoints:**

| Méthode | Endpoint | Sécurité | Description |
|---------|----------|----------|-------------|
| POST | `/register` | Public | Enregistre un nouvel utilisateur |
| POST | `/login` | Public | Authentifie un utilisateur |
| POST | `/refresh-token` | Authentifié | Rafraîchit le token d'accès |
| POST | `/forgot-password` | Public | Envoie un code de réinitialisation |
| POST | `/reset-password` | Public | Réinitialise le mot de passe |
| POST | `/verify-code` | Public | Vérifie le code de validation |
| GET | `/me` | Authentifié | Récupère les infos utilisateur |
| POST | `/logout` | Authentifié | Déconnecte l'utilisateur |

### 2. UserController

**Base URL:** `/api/v1/users`

**Endpoints:**

| Méthode | Endpoint | Sécurité | Description |
|---------|----------|----------|-------------|
| GET | `/` | Authentifié | Récupère tous les utilisateurs |
| GET | `/{id}` | Authentifié | Récupère un utilisateur par ID |
| POST | `/` | ADMIN | Crée un nouvel utilisateur |
| PUT | `/{id}` | ADMIN | Met à jour un utilisateur |
| DELETE | `/{id}` | ADMIN | Supprime un utilisateur |
| PATCH | `/{id}/activate` | ADMIN | Active un utilisateur |
| PATCH | `/{id}/deactivate` | ADMIN | Désactive un utilisateur |
| PATCH | `/{id}/ban` | ADMIN | Bannit un utilisateur |
| PATCH | `/{id}/unban` | ADMIN | Débannit un utilisateur |
| PATCH | `/{id}/block` | ADMIN | Bloque un utilisateur |
| PATCH | `/{id}/unblock` | ADMIN | Débloque un utilisateur |
| GET | `/status/{status}` | ADMIN | Récupère les utilisateurs par statut |
| GET | `/statistics` | ADMIN | Récupère les statistiques utilisateurs |

### 3. LogsController

**Base URL:** `/api/v1/logs`

**Endpoints:**

| Méthode | Endpoint | Sécurité | Description |
|---------|----------|----------|-------------|
| GET | `/statistics` | ADMIN | Récupère les statistiques de logs |
| GET | `/` | ADMIN | Récupère tous les logs (pagination) |
| GET | `/level/{level}` | ADMIN | Récupère les logs par niveau |
| GET | `/search` | ADMIN | Recherche les logs |
| GET | `/filter` | ADMIN | Filtre les logs |
| GET | `/export/json` | ADMIN | Exporte les logs en JSON |
| GET | `/export/csv` | ADMIN | Exporte les logs en CSV |
| DELETE | `/` | ADMIN | Vide la mémoire des logs |

### 4. SuspiciousIPController

**Base URL:** `/api/v1/suspicious-ips`

**Endpoints:**

| Méthode | Endpoint | Sécurité | Description |
|---------|----------|----------|-------------|
| GET | `/statistics` | ADMIN | Récupère les statistiques d'IPs suspectes |
| GET | `/` | ADMIN | Récupère toutes les IPs suspectes |
| GET | `/threat/{level}` | ADMIN | Récupère les IPs par niveau de menace |
| GET | `/status/{status}` | ADMIN | Récupère les IPs par statut |
| GET | `/search` | ADMIN | Recherche les IPs suspectes |
| GET | `/{ipAddress}` | ADMIN | Récupère une IP suspecte |
| POST | `/detect` | ADMIN | Détecte et enregistre une IP suspecte |
| POST | `/increment/{ipAddress}` | ADMIN | Incrémente le compteur de tentatives |
| POST | `/block/{ipAddress}` | ADMIN | Bloque une IP |
| POST | `/unblock/{ipAddress}` | ADMIN | Débloque une IP |
| PUT | `/threat-level/{ipAddress}` | ADMIN | Met à jour le niveau de menace |

### 5. GeoBlockingController

**Base URL:** `/api/v1/geo-blocking`

**Endpoints:**

| Méthode | Endpoint | Sécurité | Description |
|---------|----------|----------|-------------|
| GET | `/statistics` | ADMIN | Récupère les statistiques de geo-blocking |
| GET | `/` | ADMIN | Récupère toutes les règles |
| GET | `/continent/{code}` | ADMIN | Récupère les règles par continent |
| GET | `/status/{status}` | ADMIN | Récupère les règles par statut |
| GET | `/search` | ADMIN | Recherche par pays |
| GET | `/country/{code}` | ADMIN | Récupère une règle par pays |
| POST | `/block/{code}` | ADMIN | Bloque un pays |
| POST | `/unblock/{code}` | ADMIN | Débloque un pays |
| POST | `/block-continent/{code}` | ADMIN | Bloque un continent |
| POST | `/unblock-continent/{code}` | ADMIN | Débloque un continent |
| POST | `/unblock-all` | ADMIN | Débloque tous les pays |
| PUT | `/threat-score/{code}` | ADMIN | Met à jour le score de menace |

### 6. AnalyticsController

**Base URL:** `/api/v1/analytics`

**Endpoints:**

| Méthode | Endpoint | Sécurité | Description |
|---------|----------|----------|-------------|
| GET | `/` | ADMIN | Récupère toutes les analytics |
| GET | `/ip/{ipAddress}` | ADMIN | Récupère les analytics par IP |
| GET | `/user/{userId}` | ADMIN | Récupère les analytics par utilisateur |
| GET | `/metrics/24h` | ADMIN | Métriques des dernières 24h |
| GET | `/metrics/7d` | ADMIN | Métriques des 7 derniers jours |
| GET | `/metrics/30d` | ADMIN | Métriques des 30 derniers jours |
| GET | `/metrics/current-month` | ADMIN | Métriques du mois en cours |
| GET | `/metrics/custom` | ADMIN | Métriques personnalisées |
| GET | `/country/{country}` | ADMIN | Analytics par pays |
| GET | `/device/{deviceType}` | ADMIN | Analytics par type d'appareil |

### 7. SystemMetricsController

**Base URL:** `/api/v1/system-metrics`

**Endpoints:**

| Méthode | Endpoint | Sécurité | Description |
|---------|----------|----------|-------------|
| GET | `/` | ADMIN | Récupère les métriques système |
| POST | `/sms-sent/increment` | ADMIN | Incrémente le compteur SMS |
| POST | `/api-requests/increment` | ADMIN | Incrémente les requêtes API |
| POST | `/api-errors/increment` | ADMIN | Incrémente les erreurs API |
| POST | `/active-users/update` | ADMIN | Met à jour les utilisateurs actifs |

---

## Services

### AuthService

Service d'authentification gérant:
- Enregistrement d'utilisateurs
- Connexion
- Rafraîchissement de token
- Réinitialisation de mot de passe
- Vérification de code
- Déconnexion

### UserService

Service de gestion des utilisateurs avec opérations CRUD et gestion des statuts (activate, deactivate, ban, unban, block, unblock).

### LogService

Service de gestion des logs système avec:
- Pagination
- Filtrage par niveau
- Recherche
- Export (JSON, CSV)
- Statistiques

### SuspiciousIPService

Service de surveillance des IPs suspectes avec:
- Détection automatique
- Gestion des niveaux de menace
- Blocage/déblocage
- Incrémentation de tentatives

### GeoBlockingService

Service de geo-blocking par pays avec:
- Blocage par pays
- Blocage par continent
- Gestion des scores de menace
- Statistiques

### AnalyticsAggregationService

Service d'agrégation des analytics avec:
- Agrégation temporelle (24h, 7j, 30j, mois)
- Agrégation personnalisée
- Statistiques par pays, appareil, etc.

### SystemMetricsService

Service de métriques système avec:
- Métriques CPU, Mémoire, Disque
- Compteurs SMS, requêtes API, erreurs
- Utilisateurs actifs

### SecurityEventLogger

Service de logging détaillé des événements de sécurité.

---

## Base de Données

### Configuration MySQL

```yaml
spring:
  r2dbc:
    url: r2dbc:mysql://localhost:8889/abdatydb
    username: root
    password: root
    pool:
      initial-size: 5
      max-size: 20
```

### Entités Principales

#### User
- `id`: Identifiant unique
- `username`: Nom d'utilisateur
- `email`: Adresse email
- `password`: Mot de passe hashé
- `firstName`: Prénom
- `lastName`: Nom
- `phoneNumber`: Numéro de téléphone
- `role`: Rôle (USER, ADMIN)
- `createdAt`: Date de création
- `updatedAt`: Date de mise à jour
- `isActive`: Statut d'activité
- `version`: Version pour optimisme

#### SuspiciousIP
- `id`: Identifiant unique
- `ipAddress`: Adresse IP
- `threatLevel`: Niveau de menace (LOW, MEDIUM, HIGH, CRITICAL)
- `blockStatus`: Statut de blocage (BLOCKED, NOT_BLOCKED)
- `attemptCount`: Nombre de tentatives
- `suspicionReason`: Raison de suspicion
- `lastSeen`: Dernière activité

#### GeoBlocking
- `id`: Identifiant unique
- `countryCode`: Code pays
- `countryName`: Nom du pays
- `continentCode`: Code continent
- `accessStatus`: Statut d'accès (ALLOWED, BLOCKED)
- `threatScore`: Score de menace (0-10)

---

## Seeder Admin

Le seeder admin crée automatiquement un utilisateur admin au démarrage si inexistant.

**Configuration:**
```bash
ADMIN_USERNAME=admin
ADMIN_EMAIL=admin@abdatytch.com
ADMIN_PASSWORD=Admin@123
ADMIN_SEEDER_ENABLED=true
```

**Caractéristiques:**
- Vérifie si l'admin existe déjà
- Hash le mot de passe avec BCrypt
- Crée l'utilisateur avec rôle ADMIN
- Log les informations de connexion

---

## Démarrage

### Prérequis

- Java 17+
- Maven 3.8+
- MySQL (MAMP ou autre)
- Redis
- Kafka (optionnel)

### Installation

```bash
# Cloner le projet
git clone <repository-url>
cd backend

# Configurer les variables d'environnement
cp .env.example .env
# Éditer .env avec vos configurations

# Installer les dépendances
mvn clean install

# Créer la base de données MySQL
# Nom: abdatydb
# User: root
# Password: root
# Port: 8889

# Démarrer l'application
mvn spring-boot:run
```

### Vérification

Une fois démarré:
- Swagger UI: http://localhost:8080/swagger-ui.html
- Actuator: http://localhost:8080/actuator
- Health: http://localhost:8080/actuator/health

---

## API Documentation

### Authentification

La plupart des endpoints nécessitent un token JWT dans le header:

```http
Authorization: Bearer <access_token>
```

### Rôles

- **USER**: Accès basique (lecture de profil)
- **ADMIN**: Accès complet (gestion utilisateurs, logs, sécurité)

### Exemples de Requêtes

#### Enregistrement
```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "Password@123",
  "firstName": "John",
  "lastName": "Doe",
  "phoneNumber": "+1234567890"
}
```

#### Connexion
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "Password@123"
}
```

#### Rafraîchissement de Token
```http
POST /api/v1/auth/refresh-token
Content-Type: application/json
Authorization: Bearer <refresh_token>

{
  "refreshToken": "<refresh_token>"
}
```

---

## Fonctionnalités de Sécurité Avancées

### 1. Rate Limiting
- Par IP: 100 requêtes/minute
- Par utilisateur: 200 requêtes/minute
- Stocké dans Redis

### 2. IP Blacklist Dynamique
- Blocage automatique après 10 tentatives
- Géré via SuspiciousIPRepository
- Période de cooldown configurable

### 3. Geo-Blocking
- Blocage par pays
- Blocage par continent
- Scores de menace (0-10)
- Intégration MaxMind GeoIP2

### 4. Security Headers
- HSTS avec max-age 1 an
- CSP restrictive
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- X-XSS-Protection: 1; mode=block

### 5. Input Validation
- Validation de la longueur (max 10000 caractères)
- Nettoyage des caractères de contrôle
- Protection XSS

### 6. DDoS Protection
- Circuit Breaker avec seuil de 70% d'échec
- Timeout de 30ms
- Seuil de 1000 requêtes

---

## Monitoring

### Métriques
- Métriques JWT (génération, validation)
- Métriques système (CPU, Mémoire, Disque)
- Métriques API (requêtes, erreurs)
- Métriques utilisateurs (actifs, SMS)

### Tracing
- Zipkin pour distributed tracing
- Brave comme implémentation

### Actuator Endpoints
- `/actuator/health`: État de santé
- `/actuator/metrics`: Métriques Prometheus
- `/actuator/prometheus`: Export Prometheus
- `/actuator/info`: Informations de l'application

---

## Configuration de Sécurité

### SecurityConfig

Configuration de la chaîne de filtres Spring Security:

```java
- CSRF: Désactivé par défaut (configurable)
- Form Login: Désactivé
- HTTP Basic: Désactivé
- CORS: Configurable
- PathMatchers:
  - /api/auth/**: permitAll
  - /actuator/health, /actuator/info: permitAll
  - /swagger-ui/**, /v3/api-docs/**: permitAll
  - /actuator/**: hasRole('ADMIN')
  - /api/admin/**: hasRole('ADMIN')
  - /api/users/**: authenticated
  - anyExchange: authenticated
```

---

## Développement

### Linting
- Java: Standard Java conventions
- Maven: mvn checkstyle:check

### Tests
- Tests unitaires: `mvn test`
- Tests d'intégration: `mvn verify`

---

## License

Propriétaire - Abdaty Technologies

---

## Support

Pour toute question ou problème, contacter l'équipe de développement.
