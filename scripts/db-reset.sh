#!/bin/bash

# Wisebits Chat - Database Reset Script
# Resets MongoDB to a clean state

set -e  # Exit on error

echo "🗄️  Wisebits Chat - Database Reset"
echo "=================================="

# Confirmation prompt
echo ""
echo "⚠️  WARNING: This will delete ALL data in the MongoDB database!"
echo "   This includes:"
echo "   - All users"
echo "   - All conversations"
echo "   - All messages"
echo "   - All stories"
echo ""
read -p "Are you sure you want to continue? (yes/no): " CONFIRM

if [ "$CONFIRM" != "yes" ]; then
    echo "❌ Database reset cancelled"
    exit 0
fi

echo ""
echo "🛑 Stopping Docker containers..."
docker-compose down

echo ""
echo "🗑️  Removing MongoDB volumes..."
docker volume rm wisebits_chat_mongodb_data 2>/dev/null || echo "   Volume already removed or doesn't exist"
docker volume rm wisebits_chat_stories-uploads 2>/dev/null || echo "   Stories volume already removed or doesn't exist"

echo ""
echo "🚀 Starting MongoDB..."
docker-compose up -d mongo mongo-express

echo ""
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

echo ""
echo "✅ Database reset complete!"
echo ""
echo "📝 MongoDB is now running with a clean database."
echo "   - MongoDB: mongodb://localhost:27017"
echo "   - MongoDB Admin: http://localhost:8081"
echo ""
echo "💡 Next steps:"
echo "   1. Restart backend if it was running:"
echo "      cd backend && pnpm start:dev"
echo "   2. Register new users to start fresh"
echo ""
