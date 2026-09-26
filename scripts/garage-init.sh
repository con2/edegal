#!/usr/bin/env bash
# Prepares the local Garage from docker-compose.yaml: applies a single-node layout and creates the
# development bucket and key plus a separate test bucket and key. Safe to rerun. Prints the
# S3_* lines for .env and the TEST_S3_* lines for `npm run test:integration:s3`:
#
#   docker compose up -d && scripts/garage-init.sh
#   eval "$(scripts/garage-init.sh | grep ^export)"
set -euo pipefail

garage() {
  docker compose exec -T garage /garage "$@"
}

until garage status >/dev/null 2>&1; do sleep 1; done

if garage layout show | grep -q 'NO ROLE ASSIGNED\|No nodes currently have a role'; then
  node_id=$(garage status | awk '/^[0-9a-f]{16} /{print $1; exit}')
  garage layout assign -z dc1 -c 10G "$node_id" >/dev/null
  garage layout apply --version 1 >/dev/null
fi

ensure_bucket_and_key() {
  local name=$1
  garage bucket info "$name" >/dev/null 2>&1 || garage bucket create "$name" >/dev/null
  garage key info "$name" >/dev/null 2>&1 || garage key create "$name" >/dev/null
  garage bucket allow --read --write --owner "$name" --key "$name" >/dev/null
}

credentials() {
  local name=$1 prefix=$2
  local info
  info=$(garage key info --show-secret "$name")
  echo "export ${prefix}ENDPOINT=http://localhost:3900"
  echo "export ${prefix}BUCKET=$name"
  echo "export ${prefix}ACCESS_KEY_ID=$(awk '/^Key ID:/{print $3}' <<<"$info")"
  echo "export ${prefix}SECRET_ACCESS_KEY=$(awk '/^Secret key:/{print $3}' <<<"$info")"
}

ensure_bucket_and_key edegal
ensure_bucket_and_key edegal-test

echo "# Development (.env):"
credentials edegal S3_
echo "# Integration tests (npm run test:integration:s3):"
credentials edegal-test TEST_S3_
