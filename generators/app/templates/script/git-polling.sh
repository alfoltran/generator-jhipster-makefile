#!/usr/bin/env bash

function polling() {
  git fetch --prune origin >/dev/null 2>&1
  git merge origin/master
  TAG=$(git describe --abbrev=0 --tags)
  SHA=$(git rev-list -n 1 "$TAG")
  LAST_SHA=$(cat .rev 2>/dev/null || true)
  RESULT=1
  if [ "$SHA" != "$LAST_SHA" ]; then
    echo "$SHA" >.rev
    RESULT=0
  fi
  return ${RESULT}
}

function triggerPipeline() {
  echo "Starting pipeline on $TAG..."
  make GIT_SHA="$SHA" GIT_REF="$TAG" GIT_TOKEN="${GITLAB_API_TOKEN}"
  echo "Pipeline done!"
}

(
  if (flock -n 1001); then
    echo "Starting polling job..."
    if polling; then
      triggerPipeline
    fi
    echo "Done!"
  else
    echo "Already there is a process running!"
  fi
) 1001>.cicd
