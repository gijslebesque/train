#!/bin/bash
# setup-ollama.sh - Setup script for Ollama with models

set -e

echo "🦙 Setting up Ollama with AI models..."

# Check if Ollama container is running
if ! docker ps | grep -q "sporty_ollama"; then
    echo "❌ Ollama container is not running!"
    echo "Please start it first with: docker-compose --profile ollama up -d"
    exit 1
fi

echo "✅ Ollama container is running"

# Wait for Ollama to be ready
echo "⏳ Waiting for Ollama to be ready..."
sleep 15

# Check if Ollama API is responding by trying to list models
if ! docker exec sporty_ollama ollama list > /dev/null 2>&1; then
    echo "❌ Ollama API is not responding. Please check the container logs."
    exit 1
fi

echo "✅ Ollama API is ready"

# List of models to install
MODELS=("mistral:7b")

echo "📥 Installing AI models..."

for model in "${MODELS[@]}"; do
    echo "Checking for model: $model"
    
    if docker exec sporty_ollama ollama list | grep -q "$model"; then
        echo "✅ $model is already installed"
    else
        echo "📥 Installing $model (this may take several minutes)..."
        docker exec sporty_ollama ollama pull "$model"
        echo "✅ $model installed successfully!"
    fi
done

echo ""
echo "📋 Installed models:"
docker exec sporty_ollama ollama list

echo ""
echo "🧪 Testing mistral:7b model..."
docker exec sporty_ollama ollama run mistral:7b "Hello! Can you help me with fitness training?" --verbose

echo ""
echo "🎉 Ollama setup complete!"
echo ""
echo "💡 Usage:"
echo "  - Set AI_PROVIDER=ollama in your .env file"
echo "  - Restart your backend: docker-compose restart backend"
echo "  - Test recommendations: curl http://localhost:8000/recommendations"
