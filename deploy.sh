#!/usr/bin/env bash
# Pull the latest code from GitHub and redeploy the dashboard on the server.
#
#   cd /app/jazeera-dashboard && bash deploy.sh          # deploy if there is something new
#   cd /app/jazeera-dashboard && bash deploy.sh --force  # rebuild + restart even if up to date
#
# Safe by default: backs up .next/, refuses to run over uncommitted tracked changes,
# and rolls back (code + .next + restart) if the build or the health check fails.

# The whole script lives in a function so that `git pull` replacing this very file
# can't confuse bash while it is still reading it.
main() {
  set -euo pipefail

  APP_DIR="/app/jazeera-dashboard"
  PM2_NAME="jazeera-dashboard"
  HEALTH_URL="http://localhost:3000/login"
  KEEP_BACKUPS=5
  FORCE=0
  [ "${1:-}" = "--force" ] && FORCE=1

  cd "$APP_DIR"

  if [ -n "$(git status --porcelain --untracked-files=no)" ]; then
    echo "✖ Uncommitted changes to tracked files on the server — refusing to deploy:"
    git status --short --untracked-files=no
    echo "  Commit them, or discard with: git checkout -- <file>"
    exit 1
  fi

  OLD=$(git rev-parse HEAD)
  git fetch --quiet origin
  git merge --ff-only --quiet origin/main
  NEW=$(git rev-parse HEAD)

  CHANGED=""
  [ "$OLD" != "$NEW" ] && CHANGED=$(git diff --name-only "$OLD" "$NEW")

  if [ "$OLD" = "$NEW" ]; then
    echo "• Already at $(git rev-parse --short HEAD)"
  else
    echo "• Updated $(git rev-parse --short "$OLD") → $(git rev-parse --short "$NEW")"
    git log --oneline "$OLD..$NEW"
  fi

  needs_build=$FORCE
  echo "$CHANGED" | grep -qE '^(app/|components/|lib/|public/|middleware\.ts|package(-lock)?\.json|next\.config|tsconfig\.json|postcss)' && needs_build=1

  if [ "$needs_build" -eq 0 ]; then
    echo "✔ Nothing that needs a rebuild changed. Done."
    exit 0
  fi

  TS=$(date +%Y%m%d-%H%M%S)
  BACKUP=".next.bak-$TS"
  [ -d .next ] && cp -a .next "$BACKUP"

  rollback() {
    echo "✖ $1 — rolling back to $(git rev-parse --short "$OLD")"
    git reset --quiet --hard "$OLD"
    if [ -d "$BACKUP" ]; then rm -rf .next && cp -a "$BACKUP" .next; fi
    pm2 restart "$PM2_NAME" --update-env > /dev/null || true
    exit 1
  }

  if echo "$CHANGED" | grep -qE '^package(-lock)?\.json'; then
    echo "• package files changed — installing dependencies"
    npm ci || rollback "npm ci failed"
  fi

  echo "• Building"
  npm run build || rollback "build failed"

  echo "• Restarting $PM2_NAME"
  pm2 restart "$PM2_NAME" --update-env > /dev/null

  for _ in 1 2 3 4 5 6 7 8 9 10; do
    sleep 2
    code=$(curl -s -o /dev/null -w '%{http_code}' "$HEALTH_URL")
    if [ "$code" = "200" ]; then
      echo "✔ Healthy at $(git rev-parse --short HEAD). Previous build kept in $BACKUP"
      ls -dt .next.bak-* 2>/dev/null | tail -n +$((KEEP_BACKUPS + 1)) | xargs -r rm -rf
      exit 0
    fi
  done
  rollback "health check failed"
}

main "$@"
exit $?
