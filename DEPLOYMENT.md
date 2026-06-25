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

### 5. nginx/Apache (port 81 ou 443) → conteneurs
Reverse-proxy vers le frontend (`127.0.0.1:3000`) et le backend (`127.0.0.1:8080`).
Exemple Apache (vhost 443) :
```apache
ProxyPreserveHost On
ProxyPass        /api/     http://127.0.0.1:8080/api/
ProxyPassReverse /api/     http://127.0.0.1:8080/api/
ProxyPass        /uploads/ http://127.0.0.1:8080/uploads/
ProxyPass        /ws/      ws://127.0.0.1:8080/ws/
ProxyPassReverse /ws/      ws://127.0.0.1:8080/ws/
ProxyPass        /         http://127.0.0.1:3000/
ProxyPassReverse /         http://127.0.0.1:3000/
```
`sudo a2enmod proxy proxy_http proxy_wstunnel && sudo systemctl reload apache2`

## Secrets GitHub Actions
`VPS_IP`, `VPS_USER`, `SSH_PRIVATE_KEY` (+ variable `DEPLOY_PATH` si ≠ `/opt/backend/abdaty`).
L'utilisateur doit être dans le groupe `docker` et avoir sa clé publique autorisée.

## Déploiement
`git push origin main` → tests, puis envoi du source + `docker compose up -d --build`
sur le VPS. (CI + Sécurité tournent en parallèle.)
