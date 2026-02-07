#!/bin/bash

# Wisebits Chat - Project Setup Script
# This script automates the initial setup of the development environment

set -e  # Exit on error

echo "🚀 Wisebits Chat - Project Setup"
echo "================================="

# Check prerequisites
echo ""
echo "📋 Checking prerequisites..."

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js v20 or higher."
    exit 1
fi
NODE_VERSION=$(node -v | cut -d 'v' -f 2 | cut -d '.' -f 1)
if [ "$NODE_VERSION" -lt 20 ]; then
    echo "❌ Node.js version must be 20 or higher. Current: $(node -v)"
    exit 1
fi
echo "✅ Node.js $(node -v)"

# Check pnpm
if ! command -v pnpm &> /dev/null; then
    echo "❌ pnpm not found. Installing pnpm..."
    npm install -g pnpm
fi
echo "✅ pnpm $(pnpm -v)"

# Check Docker
if ! command -v docker &> /dev/null; then
    echo "⚠️  Docker not found. Docker is required for MongoDB."
    echo "   Please install Docker Desktop: https://www.docker.com/products/docker-desktop"
    exit 1
fi
echo "✅ Docker $(docker -v | awk '{print $3}' | sed 's/,//')"

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
pnpm install

# Create environment files if they don't exist
echo ""
echo "🔧 Setting up environment variables..."

# Backend .env
if [ ! -f "backend/.env" ]; then
    echo "Creating backend/.env..."
    cat > backend/.env << EOF
MONGO_USER=root
MONGO_PASSWORD=example
JWT_SECRET=supersecretkey
PORT=3000
EOF
    echo "✅ Created backend/.env"
else
    echo "✅ backend/.env already exists"
fi

# Root .env (for Docker Compose)
if [ ! -f ".env" ]; then
    echo "Creating root .env..."
    cat > .env << EOF
MONGO_USER=root
MONGO_PASSWORD=example
EOF
    echo "✅ Created .env"
else
    echo "✅ Root .env already exists"
fi

# Install Playwright browsers
echo ""
echo "🎭 Installing Playwright browsers..."
cd frontend
npx playwright install chromium
cd ..
echo "✅ Playwright browsers installed"

# Start Docker containers
echo ""
echo "🐳 Starting Docker containers..."
docker-compose up -d mongo mongo-express
echo "⏳ Waiting for MongoDB to be ready..."
sleep 5

# Verify MongoDB connection
MAX_RETRIES=10
RETRY_COUNT=0
until docker-compose exec -T mongo mongosh --eval "db.adminCommand('ping')" --quiet > /dev/null 2>&1; do
    RETRY_COUNT=$((RETRY_COUNT + 1))
    if [ $RETRY_COUNT -ge $MAX_RETRIES ]; then
        echo "❌ MongoDB failed to start after $MAX_RETRIES attempts"
        exit 1
    fi
    echo "   Waiting for MongoDB... ($RETRY_COUNT/$MAX_RETRIES)"
    sleep 3
done
echo "✅ MongoDB is ready"

# Summary
echo ""
echo "✅ Setup complete!"
echo ""
echo "📝 Next steps:"
echo "   1. Start development environment:"
echo "      pnpm start:dev"
echo ""
echo "   2. Access the application:"
echo "      - Frontend: http://localhost:5173"
echo "      - Backend API: http://localhost:3000"
echo "      - MongoDB Admin: http://localhost:8081"
echo ""
echo "   3. Run tests:"
echo "      pnpm test"
echo ""
echo "Happy coding! 🎉"
