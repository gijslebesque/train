#!/bin/bash

# Script to stop the database

echo "Stopping PostgreSQL database..."

docker-compose -f docker-compose.db-only.yml down

echo "✅ Database stopped!"
