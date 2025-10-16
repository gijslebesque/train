#!/bin/bash
# deploy.sh - Deployment script for Sporty backend

set -e

echo "🚀 Deploying Sporty Backend..."

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ Error: .env file not found!"
    echo "Please create a .env file with your environment variables."
    echo "You can copy from env.example: cp env.example .env"
    exit 1
fi

# Load environment variables
export $(cat .env | grep -v '^#' | xargs)

# Check required environment variables
required_vars=("OPENAI_API_KEY" "STRAVA_CLIENT_ID" "STRAVA_CLIENT_SECRET")
for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
        echo "❌ Error: $var is not set in .env file"
        exit 1
    fi
done

echo "✅ Environment variables loaded"

# Build and start services
echo "🔨 Building Docker images..."
docker-compose build

echo "🚀 Starting services..."
docker-compose up -d

# Wait for services to be healthy
echo "⏳ Waiting for services to be ready..."
sleep 10

# Check if services are running
if docker-compose ps | grep -q "Up"; then
    echo "✅ Services are running!"
    
    # Check if Ollama is running and pull model if needed
    if docker-compose ps | grep -q "sporty_ollama"; then
        echo "🦙 Ollama detected, checking for models..."
        
        # Wait a bit for Ollama to be ready
        sleep 10
        
        # Check if llama2 model exists
        if ! docker exec sporty_ollama ollama list | grep -q "llama2"; then
            echo "📥 Pulling llama2 model (this may take a few minutes)..."
            docker exec sporty_ollama ollama pull llama2
            echo "✅ llama2 model downloaded!"
        else
            echo "✅ llama2 model already available!"
        fi
    fi
    
    echo ""
    echo "🌐 Backend API: http://localhost:8000"
    echo "📚 API Docs: http://localhost:8000/docs"
    echo "💚 Health Check: http://localhost:8000/health"
    echo ""
    echo "📊 Service Status:"
    docker-compose ps
else
    echo "❌ Services failed to start. Check logs:"
    docker-compose logs
    exit 1
fi

echo ""
echo "🎉 Deployment complete!"
