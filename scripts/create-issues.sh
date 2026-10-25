#!/usr/bin/env bash
# Turn each backlog ticket into a GitHub issue. Requires the gh CLI and a repo remote.
set -euo pipefail
for f in .github/agent-backlog/*.md; do
  title=$(head -1 "$f" | sed 's/^# //')
  gh issue create --title "$title" --body-file "$f" --label agent-ready
done
