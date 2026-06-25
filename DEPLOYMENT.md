# Déploiement — Abdaty Technologie (VPS production)

**Même stack qu'en développement** : un seul `docker-compose.yml` (front + back en
Docker + PostgreSQL/Redis/Kafka + observabilité). Les valeurs de prod (URLs, secrets)
viennent des fichiers `.env` posés **une fois** sur le VPS.

Déploiement automatique par **push sur `main`** : tests (CI) → sur le VPS,
`git pull` + `docker compose up -d --build` (reconstruit tout, comme en dev).

## Principe

```
VPS : <DEPLOY_PATH = /opt/backend/abdaty>   ← clone du dépôt
├── docker-compose.yml      # le MÊME qu'en dev
├── .env                    # ⚠️ ONE-TIME : valeurs publiques de prod (URLs, ports)
├── frontend/.env.local     # ⚠️ ONE-TIME : NEXTAUTH_* (secrets frontend)
├── backend/.env            # ⚠️ ONE-TIME : secrets backend (JWT, MAIL, ADMIN, DB)
├── frontend/  backend/  observabilite/   # source (suivie par git)
/opt/geoip/*.mmdb           # bases MaxMind (déjà présentes, partagées)
```
> Les `.env*` sont gitignorés → `git pull` ne les écrase jamais.

## Setup unique (une fois sur le VPS)

### 1. Cloner le dépôt + droits Docker
```bash
sudo mkdir -p /opt/backend && sudo chown -R $USER:$USER /opt/backend
cd /opt/backend
git clone https://github.com/Sissoko90/abdaty.git abdaty   # ou en SSH (deploy key)
sudo usermod -aG docker $USER          # docker sans sudo (re-login ensuite)
```
> Dépôt **privé** : pour que `git pull` marche sans interaction, ajouter une
> **deploy key** GitHub (Settings → Deploy keys) avec la clé publique du VPS,
> et cloner en SSH : `git clone git@github.com:Sissoko90/abdaty.git abdaty`.

### 2. `.env` racine (substitution compose — valeurs publiques de prod)
`/opt/backend/abdaty/.env` :
```ini
NEXT_PUBLIC_API_URL=https://abdatytch.com/api/v1
NEXT_PUBLIC_SITE_URL=https://abdatytch.com
GEOIP_HOST_PATH=/opt/geoip
POSTGRES_HOST_PORT=5432
MAIL_USERNAME=...          # pour les emails d'alerte Grafana
MAIL_PASSWORD=...          # mot de passe d'application Gmail
```

### 3. Secrets frontend — `/opt/backend/abdaty/frontend/.env.local`
```ini
NEXTAUTH_URL=https://abdatytch.com
NEXTAUTH_SECRET=<secret_fort_32+_caractères>
NEXT_PUBLIC_API_URL=https://abdatytch.com/api/v1
```

### 4. Secrets backend — `/opt/backend/abdaty/backend/.env`
```ini
DB_NAME=abdatydb
DB_USERNAME=postgres
DB_PASSWORD=<mot_de_passe_fort>
JWT_...=...
MAIL_USERNAME=...
MAIL_PASSWORD=...
ADMIN_EMAIL=...
ADMIN_PASSWORD=...
# DB_HOST / REDIS_HOST / KAFKA_BROKERS sont fixés par le compose (réseau Docker).
```
> ⚠️ `DB_USERNAME`/`DB_PASSWORD`/`DB_NAME` doivent correspondre à ce que le `.env`
> racine passe à postgres (mêmes variables) — voir le service `postgres` du compose.

### 5. nginx (port 81) → conteneurs
```nginx
server {
    listen 81;
    server_name abdatytch.com www.abdatytch.com;
    location / {                       # frontend (conteneur sur 3000)
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    location /api/      { proxy_pass http://127.0.0.1:8080; proxy_set_header Host $host; }
    location /uploads/  { proxy_pass http://127.0.0.1:8080; }
    location /ws/ {                     # WebSocket notifications
        proxy_pass http://127.0.0.1:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
    }
}
```
> TLS (443 / Let's Encrypt) géré par votre config nginx existante.

### 6. Secrets GitHub Actions
`VPS_IP`, `VPS_USER`, `SSH_PRIVATE_KEY` (clé privée de l'utilisateur de déploiement).
Variable optionnelle `DEPLOY_PATH` si le clone n'est pas dans `/opt/backend/abdaty`.

## Déploiement
```bash
git push origin main
```
→ **CI** + **Sécurité** + **Déploiement** se déclenchent. Le déploiement fait, sur le
VPS : `git fetch && git reset --hard origin/main` puis `docker compose up -d --build`.

Premier déploiement : faire le **setup unique** ci-dessus, puis pousser (ou *Re-run*).
