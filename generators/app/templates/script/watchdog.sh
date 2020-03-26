#!/usr/bin/env bash

function monitor() {
  if (diff -sq "$2" "$3" >/dev/null 2>&1); then
    echo "Stopping $1..."
    docker stop "$1" >/dev/null 2>&1
  fi
}

if [ "$#" -ne 1 ]; then
  echo "Use ./watchdog <<CONTAINER_NAME>>"
  exit 1
fi

(
  if (flock -n 1002); then
    if [ ! -f ./.watchdog ]; then
      ID=$(docker ps -f name="$1" | grep -o "^[^ C]*")
      if [ -n "$ID" ]; then
        echo "$ID" >./.watchdog
        echo "Container registred!"
        docker logs "$ID" >./.lastlog 2>&1
      else
        echo "Container not running!"
      fi
    else
      trap "rm -f .watchdog .lastlog .currlog" EXIT
      ID=$(cat ./.watchdog)
      echo "Starting monitoring $ID..."
      docker logs "$ID" >./.currlog 2>&1
      monitor "$ID" ./.lastlog ./.currlog
      echo "Done!"
    fi
  else
    echo "Already there is a process running!"
  fi
) 1002>.watching
