#!/bin/bash

echo "🗄️  Setting up PostgreSQL database for Sporty..."

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL is not installed. Please install PostgreSQL first."
    echo "   On macOS: brew install postgresql"
    echo "   On Ubuntu: sudo apt-get install postgresql postgresql-contrib"
    exit 1
fi

# Database configuration
DB_NAME="sporty"
DB_USER="sporty_user"
DB_PASSWORD="sporty_password"
DB_HOST="localhost"
DB_PORT="5432"

echo "📋 Database Configuration:"
echo "   Database: $DB_NAME"
echo "   User: $DB_USER"
echo "   Host: $DB_HOST"
echo "   Port: $DB_PORT"

# Create database and user
echo "🔧 Creating database and user..."

# Create user (ignore error if user already exists)
sudo -u postgres psql -c "CREATE USER $DB_USER WITH PASSWORD '$DB_PASSWORD';" 2>/dev/null || true

# Create database (ignore error if database already exists)
sudo -u postgres psql -c "CREATE DATABASE $DB_NAME OWNER $DB_USER;" 2>/dev/null || true

# Grant privileges
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;"

echo "✅ Database setup complete!"

# Update .env file
echo "📝 Updating .env file..."
cat >> .env << EOF

# Database Configuration
USE_DATABASE=true
DATABASE_URL=postgresql://$DB_USER:$DB_PASSWORD@$DB_HOST:$DB_PORT/$DB_NAME
EOF

echo "🎉 Database setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Install Python dependencies: pip install -r requirements.txt"
echo "2. Start your FastAPI server: uvicorn app.main:app --reload"
echo "3. The database tables will be created automatically on first run"
echo ""
echo "💡 To switch back to in-memory storage, set USE_DATABASE=false in .env"
