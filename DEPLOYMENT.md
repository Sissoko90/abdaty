# Déploiement — Abdaty Technologie (VPS production)

Le déploiement **envoie les artefacts** (jar backend + build frontend) dans
`/opt/backend/abdaty` (pas de `git pull`), puis `docker compose up -d --build`.
Le **compose et les Dockerfiles vivent sur le VPS** (posés une fois) — ils
construisent les images à partir du **jar** et du **build** envoyés.

```
/opt/backend/abdaty/
├── docker-compose.yml      # ONE-TIME (ci-dessous)
├── Dockerfile              # ONE-TIME — backend runtime (COPY app.jar)
├── app.jar                 # ← envoyé par la CI à chaque déploiement
├── .env                    # ONE-TIME — secrets + valeurs prod
├── frontend/
│   ├── Dockerfile          # ONE-TIME — frontend runtime
│   └── (server.js, .next, public, node_modules…)   # ← envoyé par la CI
└── observabilite/          # ONE-TIME — configs Prometheus/Grafana/Loki
/opt/geoip/*.mmdb           # bases MaxMind (déjà présentes)
```

## Fichiers à créer une fois sur le VPS

### `/opt/backend/abdaty/Dockerfile` (backend, exécute le jar)
```dockerfile
FROM eclipse-temurin:17-jre
WORKDIR /app
RUN groupadd -r app && useradd -r -g app app
COPY app.jar app.jar
RUN mkdir -p /app/logs /app/uploads && chown -R app:app /app
USER app
EXPOSE 8080
ENV JAVA_OPTS="-XX:MaxRAMPercentage=75.0 -XX:+UseG1GC"
ENTRYPOINT ["sh","-c","java $JAVA_OPTS -jar app.jar"]
```

### `/opt/backend/abdaty/frontend/Dockerfile` (frontend, exécute le build standalone)
```dockerfile
FROM node:20-slim
WORKDIR /app
ENV NODE_ENV=production PORT=3000 HOSTNAME=0.0.0.0
RUN groupadd -r nodejs && useradd -r -g nodejs nextjs
COPY --chown=nextjs:nodejs . .
USER nextjs
EXPOSE 3000
CMD ["node","server.js"]
```

### `/opt/backend/abdaty/docker-compose.yml`
```yaml
services:
  backend:
    build: { context: ., dockerfile: Dockerfile }
    image: abdaty/backend:prod
    container_name: abdaty-backend
    restart: unless-stopped
    ports: ["127.0.0.1:8080:8080"]
    env_file: [./.env]
    environment:
      ENVIRONMENT: production
      DB_VENDOR: postgresql
      DB_HOST: postgres
      DB_PORT: "5432"
      DB_MIGRATION_PATH: db/migration/postgresql
      SQL_INIT_MODE: always
      REDIS_HOST: redis
      KAFKA_BROKERS: kafka:29092
      MANAGEMENT_ZIPKIN_TRACING_ENDPOINT: http://zipkin:9411/api/v2/spans
      VAULT_ENABLED: "false"
    volumes:
      - backend-logs:/app/logs
      - backend-uploads:/app/uploads
      - /opt/geoip:/opt/geoip:ro
    depends_on:
      postgres: { condition: service_healthy }
      redis: { condition: service_healthy }
      kafka: { condition: service_healthy }

  frontend:
    build: { context: ./frontend }
    image: abdaty/frontend:prod
    container_name: abdaty-frontend
    restart: unless-stopped
    ports: ["127.0.0.1:3000:3000"]
    env_file: [./.env]
    environment:
      NEXTAUTH_URL: https://abdatytch.com
      INTERNAL_API_URL: http://backend:8080/api/v1
    depends_on: [backend]

  postgres:
    image: postgres:15-alpine
    container_name: abdaty-postgres
    restart: unless-stopped
    environment:
      POSTGRES_DB: ${DB_NAME:-abdatydb}
      POSTGRES_USER: ${DB_USERNAME:-postgres}
      POSTGRES_PASSWORD: ${DB_PASSWORD:-postgres}
    ports: ["127.0.0.1:5432:5432"]
    volumes: [postgres-data:/var/lib/postgresql/data]
    healthcheck: { test: ["CMD-SHELL","pg_isready -U ${DB_USERNAME:-postgres}"], interval: 10s, timeout: 5s, retries: 5 }

  redis:
    image: redis:7-alpine
    container_name: abdaty-redis
    restart: unless-stopped
    ports: ["127.0.0.1:6379:6379"]
    volumes: [redis-data:/data]
    healthcheck: { test: ["CMD","redis-cli","ping"], interval: 10s, timeout: 5s, retries: 5 }

  kafka:
    image: confluentinc/cp-kafka:latest
    container_name: abdaty-kafka
    restart: unless-stopped
    ports: ["127.0.0.1:9092:9092"]
    environment:
      CLUSTER_ID: abdaty-kafka-cluster-1
      KAFKA_NODE_ID: 1
      KAFKA_PROCESS_ROLES: broker,controller
      KAFKA_CONTROLLER_QUORUM_VOTERS: 1@localhost:9093
      KAFKA_LISTENERS: INTERNAL://0.0.0.0:29092,HOST://0.0.0.0:9092,CONTROLLER://0.0.0.0:9093
      KAFKA_ADVERTISED_LISTENERS: INTERNAL://kafka:29092,HOST://localhost:9092
      KAFKA_CONTROLLER_LISTENER_NAMES: CONTROLLER
      KAFKA_LISTENER_SECURITY_PROTOCOL_MAP: CONTROLLER:PLAINTEXT,INTERNAL:PLAINTEXT,HOST:PLAINTEXT
      KAFKA_INTER_BROKER_LISTENER_NAME: INTERNAL
      KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR: 1
      KAFKA_TRANSACTION_STATE_LOG_REPLICATION_FACTOR: 1
      KAFKA_TRANSACTION_STATE_LOG_MIN_ISR: 1
    healthcheck: { test: ["CMD","kafka-broker-api-versions","--bootstrap-server","localhost:9092"], interval: 10s, timeout: 5s, retries: 5 }

  prometheus:
    image: prom/prometheus:latest
    container_name: abdaty-prometheus
    restart: unless-stopped
    ports: ["127.0.0.1:9090:9090"]
    volumes:
      - ./observabilite/prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus-data:/prometheus

  grafana:
    image: grafana/grafana:latest
    container_name: abdaty-grafana
    restart: unless-stopped
    ports: ["127.0.0.1:3002:3000"]
    env_file: [./.env]
    environment:
      GF_SMTP_ENABLED: "true"
      GF_SMTP_HOST: smtp.gmail.com:587
      GF_SMTP_USER: ${MAIL_USERNAME:-}
      GF_SMTP_PASSWORD: ${MAIL_PASSWORD:-}
      GF_SMTP_FROM_ADDRESS: ${MAIL_USERNAME:-alerts@abdatytch.com}
    volumes:
      - grafana-data:/var/lib/grafana
      - ./observabilite/provisioning:/etc/grafana/provisioning
      - ./observabilite/dashboards:/var/lib/grafana/dashboards
    depends_on: [prometheus, loki]

  loki:
    image: grafana/loki:2.9.8
    container_name: abdaty-loki
    restart: unless-stopped
    ports: ["127.0.0.1:3100:3100"]
    command: -config.file=/etc/loki/loki-config.yml
    volumes:
      - ./observabilite/loki/loki-config.yml:/etc/loki/loki-config.yml
      - loki-data:/loki

  promtail:
    image: grafana/promtail:2.9.8
    container_name: abdaty-promtail
    restart: unless-stopped
    command: -config.file=/etc/promtail/promtail-config.yml
    volumes:
      - ./observabilite/loki/promtail-config.yml:/etc/promtail/promtail-config.yml
      - backend-logs:/var/log/abdaty:ro
    depends_on: [loki]

  zipkin:
    image: openzipkin/zipkin:latest
    container_name: abdaty-zipkin
    restart: unless-stopped
    ports: ["127.0.0.1:9411:9411"]

  vault:
    image: hashicorp/vault:latest
    container_name: abdaty-vault
    restart: unless-stopped
    ports: ["127.0.0.1:8200:8200"]
    environment: { VAULT_DEV_ROOT_TOKEN_ID: ${VAULT_DEV_ROOT_TOKEN_ID:-dev-root-token}, VAULT_DEV_LISTEN_ADDRESS: 0.0.0.0:8200 }
    cap_add: [IPC_LOCK]
    volumes: [vault-data:/vault/data]
    command: server -dev

volumes:
  postgres-data: {}
  redis-data: {}
  prometheus-data: {}
  grafana-data: {}
  loki-data: {}
  backend-logs: {}
  backend-uploads: {}
  vault-data: {}
```
> ⚠️ La promtail `prometheus.yml` doit scraper `backend:8080` (nom du service) :
> dans `/opt/backend/abdaty/observabilite/prometheus.yml`, cible
> `targets: ['backend:8080']`.

### `/opt/backend/abdaty/.env` (secrets + valeurs prod)
```ini
# Base de données (postgres ET backend)
DB_NAME=abdatydb
DB_USERNAME=postgres
DB_PASSWORD=<mot_de_passe_fort>
# Secrets backend
JWT_...=...
ADMIN_EMAIL=...
ADMIN_PASSWORD=...
# Mail (contact/newsletter + alertes Grafana)
MAIL_USERNAME=...
MAIL_PASSWORD=<mot_de_passe_application_gmail>
# Frontend (NextAuth, lu par le service frontend)
NEXTAUTH_SECRET=<secret_fort_32+>
```
> `NEXT_PUBLIC_API_URL` est **figé au build** par la CI (`https://abdatytch.com/api/v1`)
> → pas besoin ici.

### nginx (port 81)
```nginx
server {
    listen 81; server_name abdatytch.com www.abdatytch.com;
    location /     { proxy_pass http://127.0.0.1:3000; proxy_http_version 1.1;
                     proxy_set_header Host $host; proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for; }
    location /api/     { proxy_pass http://127.0.0.1:8080; proxy_set_header Host $host; }
    location /uploads/ { proxy_pass http://127.0.0.1:8080; }
    location /ws/  { proxy_pass http://127.0.0.1:8080; proxy_http_version 1.1;
                     proxy_set_header Upgrade $http_upgrade; proxy_set_header Connection "upgrade"; proxy_set_header Host $host; }
}
```

## Secrets GitHub Actions
`VPS_IP`, `VPS_USER`, `SSH_PRIVATE_KEY` (+ variable optionnelle `DEPLOY_PATH`).
L'utilisateur de déploiement doit être dans le groupe `docker` et avoir sa clé
publique dans `~/.ssh/authorized_keys`.

## Déploiement
`git push origin main` → CI + Sécurité + Déploiement. Le déploiement envoie le
`app.jar` et le build frontend, puis `docker compose up -d --build`.
