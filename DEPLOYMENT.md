# Déploiement — Abdaty Technologie (VPS production)

Déploiement automatisé par **push sur `main`** : la CI build le **jar backend** et le
**build frontend**, les transfère sur le VPS et redémarre les services.

- **Backend** : tourne en **Docker** (image construite depuis le jar), avec l'infra
  (PostgreSQL, Redis, Kafka) et l'observabilité (Prometheus, Grafana, Loki, Zipkin).
- **Frontend** : tourne en **natif** (Node, systemd) depuis `/var/www/frontend`.
- **nginx** (port 81) sert `abdatytch.com` → frontend + `/api`, `/ws`, `/uploads` → backend.

## Arborescence sur le VPS

```
/opt/backend/
├── abdaty/                 # transféré par la CI à chaque déploiement
│   ├── docker-compose.yml  #   (depuis docker-compose.prod.yml)
│   ├── Dockerfile          #   (runtime, depuis backend/Dockerfile.runtime)
│   ├── app.jar             #   (jar construit en CI)
│   ├── .env                #   ⚠️ ONE-TIME, manuel (secrets) — jamais écrasé
│   └── application.yml     #   ⚠️ ONE-TIME, manuel (override config) — jamais écrasé
└── observabilite/          # transféré par la CI (Prometheus/Grafana/Loki)
/var/www/frontend/          # build Next.js standalone (transféré par la CI)
└── .env                    #   ⚠️ ONE-TIME, manuel (NEXTAUTH_*, INTERNAL_API_URL)
/opt/geoip/*.mmdb           #   bases MaxMind (déjà présentes, partagées)
```

## Setup unique (à faire une fois sur le VPS)

### 1. Dossiers & droits
```bash
sudo mkdir -p /opt/backend/abdaty /opt/backend/observabilite /var/www/frontend
sudo chown -R application:application /opt/backend /var/www/frontend
# Docker sans sudo + redémarrage du frontend en sudo non-interactif :
sudo usermod -aG docker application
echo 'application ALL=(ALL) NOPASSWD: /usr/bin/systemctl restart abdaty-frontend' \
  | sudo tee /etc/sudoers.d/abdaty-deploy
```

### 2. Secrets backend — `/opt/backend/abdaty/.env`
Le compose lit ce `.env` (substitution + `env_file` du backend). Valeurs **prod** :
```ini
# Base de données (le conteneur postgres ET le backend utilisent ces valeurs)
DB_NAME=abdatydb
DB_USERNAME=postgres
DB_PASSWORD=<mot_de_passe_fort>
# Secrets applicatifs
JWT_...=...
MAIL_USERNAME=...
MAIL_PASSWORD=<mot_de_passe_application_gmail>
ADMIN_EMAIL=...
ADMIN_PASSWORD=...
# (DB_HOST / REDIS_HOST / KAFKA_BROKERS sont fixés par le compose : ne pas mettre localhost)
```
> `application.yml` est optionnel (le jar est piloté par l'environnement). En déposer
> un dans `/opt/backend/abdaty/application.yml` si vous voulez surcharger la config.

### 3. Secrets frontend — `/var/www/frontend/.env`
```ini
NEXTAUTH_URL=https://abdatytch.com
NEXTAUTH_SECRET=<secret_fort_32+_caractères>
# Le frontend natif joint le backend Docker publié en local :
INTERNAL_API_URL=http://127.0.0.1:8080/api/v1
```

### 4. Service systemd du frontend — `/etc/systemd/system/abdaty-frontend.service`
```ini
[Unit]
Description=Abdaty Frontend (Next.js standalone)
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
User=application
WorkingDirectory=/var/www/frontend
EnvironmentFile=/var/www/frontend/.env
Environment=NODE_ENV=production
Environment=PORT=3000
Environment=HOSTNAME=127.0.0.1
ExecStart=/usr/bin/node /var/www/frontend/server.js
Restart=on-failure
RestartSec=10
StandardOutput=journal
StandardError=journal
SyslogIdentifier=abdaty-frontend

[Install]
WantedBy=multi-user.target
```
```bash
sudo systemctl daemon-reload
sudo systemctl enable abdaty-frontend
```

### 5. nginx (port 81) — bloc serveur `abdatytch.com`
```nginx
server {
    listen 81;
    server_name abdatytch.com www.abdatytch.com;

    # Frontend (Next.js natif sur 3000)
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    # API backend (Docker sur 8080)
    location /api/      { proxy_pass http://127.0.0.1:8080; proxy_set_header Host $host;
                          proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for; }
    location /uploads/  { proxy_pass http://127.0.0.1:8080; }
    location /actuator/ { proxy_pass http://127.0.0.1:8080; }   # à restreindre (IP admin)
    # WebSocket notifications
    location /ws/ {
        proxy_pass http://127.0.0.1:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
    }
}
```
> La terminaison TLS (443 / Let's Encrypt) reste gérée par votre config nginx existante.

### 6. Secrets GitHub (déjà créés)
`VPS_IP`, `VPS_USER`, `VPS_PRIVATE_KEY` (clé privée SSH de l'utilisateur `application`).

## Déploiement

```bash
git push origin main
```
Le push déclenche **3 workflows en parallèle** :
- **CI** (`ci.yml`) — i18n, type-check, lint, build front + tests back.
- **Sécurité** (`security.yml`) — CodeQL, Trivy, gitleaks, npm audit.
- **Déploiement** (`deploy.yml`) — build jar + frontend → transfert → `docker compose up -d --build` + `systemctl restart abdaty-frontend`.

Premier déploiement : faire le **setup unique** ci-dessus AVANT le premier push.
