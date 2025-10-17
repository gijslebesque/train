#!/bin/bash

# Script to start only the database for local development

echo "Starting PostgreSQL database in Docker..."

# Start the database
docker-compose -f docker-compose.db-only.yml up -d

# Wait for database to be ready
echo "Waiting for database to be ready..."
sleep 5

# Check if database is running
if docker-compose -f docker-compose.db-only.yml ps postgres | grep -q "Up"; then
    echo "✅ Database is running!"
    echo "Database connection: postgresql://sporty_user:sporty_password@localhost:5432/sporty"
    echo ""
    echo "To stop the database: docker-compose -f docker-compose.db-only.yml down"
    echo "To view logs: docker-compose -f docker-compose.db-only.yml logs -f postgres"
else
    echo "❌ Failed to start database"
    exit 1
fi
