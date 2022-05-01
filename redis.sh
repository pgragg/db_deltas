#!/bin/bash 

docker run -dp 6379:6379 redis || true

redis-cli CONFIG SET notify-keyspace-events KEA 