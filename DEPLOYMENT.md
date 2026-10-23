# Déploiement — Abdaty Technologie (VPS production)

**Identique au local.** Le déploiement envoie le **code source** dans `/opt/backend/abdaty`
puis fait `docker compose up -d --build` : front + back sont construits sur le VPS avec
**les mêmes Dockerfiles et le même compose qu'en local**. Seules les **valeurs de prod**
(URLs, secrets) changent, via les fichiers `.env` posés **une fois** sur le VPS.

```
/opt/backend/abdaty/                ← le déploiement extrait le source ici
├── docker-compose.yml   backend/   frontend/   observabilite/   ← envoyés à chaque déploiement
├── .env                 # ⚠️ ONE-TIME : valeurs publiques de prod (URLs, ports, MAIL)
├── backend/.env         # ⚠️ ONE-TIME : secrets backend (JWT, ADMIN…)
└── frontend/.env.local  # ⚠️ ONE-TIME : NEXTAUTH_URL / NEXTAUTH_SECRET
/opt/geoip/*.mmdb        # bases MaxMind (déjà présentes)
```
> Les `.env*` sont **exclus de l'archive** → jamais écrasés par le déploiement.

## Setup unique sur le VPS

### 1. Dossier + droits + nettoyage des anciens artefacts
```bash
sudo mkdir -p /opt/backend/abdaty && sudo chown -R $USER:$USER /opt/backend
sudo usermod -aG docker $USER          # docker sans sudo (re-login ensuite)
cd /opt/backend/abdaty
# supprime les vestiges de l'ancienne approche (jar/Dockerfile/bundle) si présents :
rm -f app.jar Dockerfile
```

### 2. `.env` racine — `/opt/backend/abdaty/.env` (substitution compose)
```ini
NEXT_PUBLIC_API_URL=https://abdatytch.com/api/v1
NEXT_PUBLIC_SITE_URL=https://abdatytch.com
GEOIP_HOST_PATH=/opt/geoip
POSTGRES_HOST_PORT=5432
MAIL_USERNAME=...                 # emails alertes Grafana
MAIL_PASSWORD=...                 # mot de passe d'application Gmail
```

### 3. Secrets backend — `/opt/backend/abdaty/backend/.env`
Tes secrets applicatifs (JWT, ADMIN, MAIL…). Les variables DB/REDIS/KAFKA sont
**fixées par le compose** (réseau Docker) — pas besoin de les mettre ici.

### 4. Secrets frontend — `/opt/backend/abdaty/frontend/.env.local`
```ini
NEXTAUTH_URL=https://abdatytch.com
NEXTAUTH_SECRET=<openssl rand -base64 32>
```

### 5. nginx (443) → conteneurs
Le VPS de production (72.61.145.76) est **partagé** avec d'autres applications : les
ports hôte sont donc dédiés, fixés dans le `.env` racine (`FRONTEND_HOST_PORT=3010`,
`BACKEND_HOST_PORT=8090`, PostgreSQL/Redis/Kafka sur 15432/16379/19092) et le
déploiement ne démarre que `frontend backend` (+ dépendances).

`/etc/nginx/sites-available/abdatytch.com` (HTTPS ajouté par
`certbot --nginx -d abdatytch.com`) :
```nginx
# ⚠️ Seul /api/v1 va au backend : /api/auth, /api/contact, /api/sms sont des routes
# du site Next.js (NextAuth). Router tout /api/ vers Spring casse la connexion.
location ~ ^/(api/v1/|uploads/|v3/api-docs|api-docs|swagger-ui) {
    proxy_pass http://127.0.0.1:8090;
    proxy_hide_header WWW-Authenticate;   # pas de popup « Basic » sur les 401
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
location /ws/ {                           # notifications admin (WebSocket)
    proxy_pass http://127.0.0.1:8090;
    proxy_hide_header WWW-Authenticate;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_read_timeout 3600s;
}
location / {
    proxy_pass http://127.0.0.1:3010;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```
Toujours `sudo nginx -t` avant `sudo systemctl reload nginx` (les autres sites du
serveur dépendent de la même instance).

## Secrets GitHub Actions
`VPS_IP`, `VPS_USER`, `SSH_PRIVATE_KEY` (+ variable `DEPLOY_PATH` si ≠ `/opt/backend/abdaty`).
L'utilisateur doit être dans le groupe `docker` et avoir sa clé publique autorisée.

## Déploiement
`git push origin main` → tests, puis envoi du source + `docker compose up -d --build`
sur le VPS. (CI + Sécurité tournent en parallèle.)
