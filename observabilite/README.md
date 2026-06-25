# Observabilité — Abdaty Technologie

Observabilité complète du backend : **métriques** (Prometheus), **logs** (Loki),
**dashboards & alertes** (Grafana). Configuration provisionnée dans ce dossier
`observabilite/`, orchestrée par le `docker-compose.yml` **à la racine du dépôt**.

## Démarrage

```bash
# Depuis la racine du dépôt — stack d'observabilité seule :
docker compose up -d prometheus loki promtail grafana
# …ou toute la stack (apps + infra + observabilité) :
docker compose up -d --build
```

| Service     | URL                          | Identifiants     |
|-------------|------------------------------|------------------|
| Grafana     | http://localhost:3002        | `admin` / `admin`|
| Prometheus  | http://localhost:9090        | —                |
| Loki        | http://localhost:3100        | —                |

> Le backend conteneurisé est scrapé via `backend:8080/actuator/prometheus` et
> ses logs (volume `backend-logs`) sont lus par Promtail. Pour un backend lancé
> sur l'hôte, repasser la cible Prometheus à `host.docker.internal:8080`.

## Ce qui est provisionné automatiquement

- **Datasources** : Prometheus + Loki (`provisioning/datasources/`)
- **Dashboard** : « Abdaty Backend — Vue d'ensemble » (`dashboards/backend-overview.json`)
  - Vue d'ensemble : statut, uptime, CPU, heap, threads, req/s
  - HTTP RED : débit par statut, taux d'erreur 5xx/4xx, latence p50/p95/p99, top endpoints
  - JVM/Ressources : mémoire heap/non-heap, CPU process vs système, GC, threads
  - Logs (Loki)
- **Alertes** (`provisioning/alerting/rules.yml`) → email **maksissoko07@gmail.com** :

  | Alerte                 | Seuil          | Sévérité |
  |------------------------|----------------|----------|
  | Backend DOWN           | `up == 0` 1min | critique |
  | Taux d'erreur 5xx      | > 5 % sur 5min | critique |
  | Latence p95            | > 2 s sur 5min | warning  |
  | Mémoire heap           | > 90 % sur 5min| critique |
  | CPU process            | > 85 % sur 5min| warning  |

## Emails d'alerte (SMTP)

Grafana réutilise les identifiants Gmail du backend (`MAIL_USERNAME` / `MAIL_PASSWORD`
du `.env`). Pour changer la config, surcharger dans le `.env` :

```
GF_SMTP_USER=...           # compte Gmail expéditeur
GF_SMTP_PASSWORD=...       # mot de passe d'application Gmail (16 caractères)
ALERT_EMAIL=...            # (info) destinataire — défini en dur dans contactpoints.yml
```

> Le mot de passe Gmail doit être un **mot de passe d'application** (compte avec 2FA),
> pas le mot de passe principal.
