#!/usr/bin/env bash
set -euo pipefail

NAMESPACE="soundboard"
SECRET_NAME="soundboard-secret"

usage() {
    cat <<EOF
Usage: $(basename "$0") <write|read>

  write   Prompt for Discord secrets and update the cluster Secret
  read    Decode and show the cluster Secret
EOF
    exit 1
}

cmd_write() {
    echo "Enter Discord secrets:"
    echo ""
    read -r -p "  Token:         " TOKEN
    read -r -p "  Client ID:     " CLIENT_ID
    read -r -p "  Client Secret: " CLIENT_SECRET

    if [[ -z "${TOKEN}" && -z "${CLIENT_ID}" && -z "${CLIENT_SECRET}" ]]; then
        echo "ERROR: all fields empty — nothing to update." >&2
        exit 1
    fi

    local patch=()
    [[ -n "${TOKEN}"       ]] && patch+=("--from-literal=DISCORD_TOKEN=${TOKEN}")
    [[ -n "${CLIENT_ID}"   ]] && patch+=("--from-literal=DISCORD_CLIENT_ID=${CLIENT_ID}")
    [[ -n "${CLIENT_SECRET}" ]] && patch+=("--from-literal=DISCORD_CLIENT_SECRET=${CLIENT_SECRET}")

    kubectl -n "${NAMESPACE}" create secret generic "${SECRET_NAME}" \
        "${patch[@]}" \
        --dry-run=client -o yaml | \
        kubectl apply -f -

    echo ""
    echo "Secret '${SECRET_NAME}' updated in ${NAMESPACE}."
}

cmd_read() {
    if ! kubectl -n "${NAMESPACE}" get secret "${SECRET_NAME}" &>/dev/null; then
        echo "Secret '${SECRET_NAME}' not found in namespace '${NAMESPACE}'." >&2
        exit 1
    fi

    echo "Secrets in ${NAMESPACE}/${SECRET_NAME}:"
    echo ""
    kubectl -n "${NAMESPACE}" get secret "${SECRET_NAME}" -o jsonpath='{.data}' \
        | jq -r 'to_entries[] | "  \(.key): \(.value | @base64d)"'
}

case "${1:-}" in
    write) cmd_write ;;
    read)  cmd_read ;;
    *)     usage ;;
esac
