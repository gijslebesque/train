#!/bin/bash
# deploy-prod.sh - Production deployment script for Sporty backend

set -e

echo "🚀 Deploying Sporty Backend to Production..."

# Check if .env.prod file exists
if [ ! -f .env.prod ]; then
    echo "❌ Error: .env.prod file not found!"
    echo "Please create a .env.prod file with your production environment variables."
    exit 1
fi

# Load production environment variables
export $(cat .env.prod | grep -v '^#' | xargs)

# Check required environment variables
required_vars=("OPENAI_API_KEY" "STRAVA_CLIENT_ID" "STRAVA_CLIENT_SECRET" "POSTGRES_PASSWORD")
for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
        echo "❌ Error: $var is not set in .env.prod file"
        exit 1
    fi
done

echo "✅ Production environment variables loaded"

# Stop existing services
echo "🛑 Stopping existing services..."
docker-compose -f docker-compose.prod.yml down

# Build and start production services
echo "🔨 Building production Docker images..."
docker-compose -f docker-compose.prod.yml build

echo "🚀 Starting production services..."
docker-compose -f docker-compose.prod.yml up -d

# Wait for services to be healthy
echo "⏳ Waiting for services to be ready..."
sleep 30

# Check if services are running
if docker-compose -f docker-compose.prod.yml ps | grep -q "Up"; then
    echo "✅ Production services are running!"
    
    # Check if Ollama is running and pull model if needed
    if docker-compose -f docker-compose.prod.yml ps | grep -q "ollama"; then
        echo "🦙 Ollama detected, checking for models..."
        
        # Wait a bit for Ollama to be ready
        sleep 15
        
        # Check if mistral:7b model exists
        if ! docker exec sporty_ollama ollama list | grep -q "mistral:7b"; then
            echo "📥 Pulling mistral:7b model (this may take a few minutes)..."
            docker exec sporty_ollama ollama pull mistral:7b
            echo "✅ mistral:7b model downloaded!"
        else
            echo "✅ mistral:7b model already available!"
        fi
    fi
    
    echo ""
    echo "🌐 Backend API: http://localhost"
    echo "📚 API Docs: http://localhost/docs"
    echo "💚 Health Check: http://localhost/health"
    echo ""
    echo "📊 Service Status:"
    docker-compose -f docker-compose.prod.yml ps
else
    echo "❌ Services failed to start. Check logs:"
    docker-compose -f docker-compose.prod.yml logs
    exit 1
fi

echo ""
echo "🎉 Production deployment complete!"
echo "🔒 Remember to set up SSL certificates for HTTPS in production!"
