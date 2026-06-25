#!/usr/bin/env bash
#
# Provisionne les secrets de l'application dans Vault (KV v2, mount "secret").
# Les valeurs sont lues depuis le fichier .env (NON versionné) — rien n'est en dur.
#
# Usage :
#   ./scripts/vault-init-secrets.sh [chemin/vers/.env]
#
# Prérequis : le conteneur Vault (abdaty-vault) tourne (docker compose up -d vault).
# En mode dev, Vault est déscellé automatiquement et le token root vaut le
# VAULT_DEV_ROOT_TOKEN_ID du docker-compose (par défaut "dev-root-token").
#
set -euo pipefail

ENV_FILE="${1:-$(dirname "$0")/../.env}"
VAULT_CONTAINER="${VAULT_CONTAINER:-abdaty-vault}"
VAULT_PATH="secret/abdaty-backend"   # = spring.cloud.vault.kv.backend + default-context

if [[ ! -f "$ENV_FILE" ]]; then
  echo "ERREUR : fichier d'environnement introuvable : $ENV_FILE" >&2
  exit 1
fi

# Charge les variables du .env SANS `source` (les valeurs peuvent contenir des
# espaces, ex. mot de passe applicatif Gmail « aaaa bbbb cccc dddd »).
while IFS='=' read -r _key _value; do
  [[ "$_key" =~ ^[A-Za-z_][A-Za-z0-9_]*$ ]] || continue   # ignore commentaires / lignes vides
  _value="${_value%$'\r'}"                                  # supprime un éventuel CR (Windows)
  _value="${_value%\"}"; _value="${_value#\"}"              # retire guillemets entourants
  export "$_key=$_value"
done < "$ENV_FILE"

# Token Vault : celui du .env sinon le token root du mode dev.
TOKEN="${VAULT_TOKEN:-dev-root-token}"

vault_exec() {
  docker exec -e VAULT_ADDR=http://127.0.0.1:8200 -e VAULT_TOKEN="$TOKEN" "$VAULT_CONTAINER" "$@"
}

echo "→ Écriture des secrets dans ${VAULT_PATH} (Vault: ${VAULT_CONTAINER})…"

# Seuls les VRAIS secrets (identifiants/mots de passe) sont stockés ici. Les clés
# correspondent EXACTEMENT aux propriétés Spring lues par l'application, afin que
# Vault les surcharge directement (cf. application.yml).
vault_exec vault kv put "$VAULT_PATH" \
  spring.r2dbc.username="${DB_USERNAME:-root}" \
  spring.r2dbc.password="${DB_PASSWORD:-root}" \
  spring.data.redis.password="${REDIS_PASSWORD:-}" \
  spring.mail.username="${MAIL_USERNAME:-}" \
  spring.mail.password="${MAIL_PASSWORD:-}" \
  admin.username="${ADMIN_USERNAME:-admin}" \
  admin.email="${ADMIN_EMAIL:-}" \
  admin.password="${ADMIN_PASSWORD:-}" \
  admin.firstName="${ADMIN_FIRST_NAME:-Admin}" \
  admin.lastName="${ADMIN_LAST_NAME:-User}" \
  admin.phoneNumber="${ADMIN_PHONE_NUMBER:-}"

echo
echo "✓ Secrets provisionnés. Clés présentes dans ${VAULT_PATH} :"
vault_exec vault kv get -format=json "$VAULT_PATH" | grep -oE '"[a-zA-Z.]+": ' | tr -d '": ' | sort -u || true

echo
echo "Pour activer Vault dans l'app : VAULT_ENABLED=true et VAULT_TOKEN=${TOKEN} dans .env, puis redémarrer le backend."
