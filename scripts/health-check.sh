#!/bin/bash

# Wisebits Chat - Health Check Script
# Verifies that all services are running correctly

echo "🏥 Wisebits Chat - Health Check"
echo "================================"

ALL_HEALTHY=true

# Check Backend
echo ""
echo "🔧 Checking Backend API (port 3000)..."
if curl -s http://localhost:3000 > /dev/null; then
    RESPONSE=$(curl -s http://localhost:3000)
    echo "   ✅ Backend is running"
    echo "   Response: $RESPONSE"
else
    echo "   ❌ Backend is NOT running"
    echo "   Expected: http://localhost:3000"
    ALL_HEALTHY=false
fi

# Check Frontend Dev Server
echo ""
echo "🎨 Checking Frontend Dev Server (port 5173)..."
if curl -s http://localhost:5173 > /dev/null 2>&1; then
    echo "   ✅ Frontend dev server is running"
else
    echo "   ⚠️  Frontend dev server is NOT running"
    echo "   (This is normal if using production mode)"
fi

# Check Frontend Preview Server
echo ""
echo "🎨 Checking Frontend Preview Server (port 4173)..."
if curl -s http://localhost:4173 > /dev/null 2>&1; then
    echo "   ✅ Frontend preview server is running"
else
    echo "   ℹ️  Frontend preview server is NOT running"
    echo "   (Only needed for E2E tests)"
fi

# Check MongoDB
echo ""
echo "🗄️  Checking MongoDB (port 27017)..."
if docker-compose exec -T mongo mongosh --eval "db.adminCommand('ping')" --quiet > /dev/null 2>&1; then
    echo "   ✅ MongoDB is running and accessible"
    
    # Get database stats
    DB_COUNT=$(docker-compose exec -T mongo mongosh --quiet --eval "db.adminCommand('listDatabases').databases.length" 2>/dev/null || echo "N/A")
    echo "   Databases: $DB_COUNT"
else
    echo "   ❌ MongoDB is NOT running or not accessible"
    echo "   Start with: docker-compose up -d mongo"
    ALL_HEALTHY=false
fi

# Check Mongo Express
echo ""
echo "🖥️  Checking Mongo Express (port 8081)..."
if curl -s http://localhost:8081 > /dev/null 2>&1; then
    echo "   ✅ Mongo Express is running"
    echo "   Access at: http://localhost:8081"
else
    echo "   ⚠️  Mongo Express is NOT running"
    echo "   Start with: docker-compose up -d mongo-express"
fi

# Check Docker
echo ""
echo "🐳 Checking Docker containers..."
RUNNING_CONTAINERS=$(docker-compose ps --services --filter "status=running" 2>/dev/null || echo "")
if [ -z "$RUNNING_CONTAINERS" ]; then
    echo "   ⚠️  No Docker containers are running"
    echo "   Start with: docker-compose up -d"
else
    echo "   ✅ Running containers:"
    for container in $RUNNING_CONTAINERS; do
        echo "      - $container"
    done
fi

# Summary
echo ""
echo "================================"
if [ "$ALL_HEALTHY" = true ]; then
    echo "✅ Core services are healthy!"
    echo ""
    echo "🌐 Access URLs:"
    echo "   - Frontend (dev):  http://localhost:5173"
    echo "   - Backend API:     http://localhost:3000"
    echo "   - MongoDB Admin:   http://localhost:8081"
    echo "   - MongoDB:         mongodb://localhost:27017"
else
    echo "❌ Some core services are not running!"
    echo ""
    echo "💡 To start all services:"
    echo "   pnpm start:dev"
fi
echo ""
