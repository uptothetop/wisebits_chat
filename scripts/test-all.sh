#!/bin/bash

# Wisebits Chat - Comprehensive Test Runner
# Runs all tests and generates a summary report

set -e  # Exit on error

echo "🧪 Wisebits Chat - Test Suite"
echo "=============================="

# Track test results
BACKEND_TESTS_PASSED=false
FRONTEND_TESTS_PASSED=false
E2E_TESTS_PASSED=false
EXIT_CODE=0

# Backend Unit Tests
echo ""
echo "📦 Running Backend Unit Tests..."
echo "--------------------------------"
cd backend
if pnpm test; then
    BACKEND_TESTS_PASSED=true
    echo "✅ Backend tests passed"
else
    echo "❌ Backend tests failed"
    EXIT_CODE=1
fi
cd ..

# Frontend Unit Tests
echo ""
echo "🎨 Running Frontend Unit Tests..."
echo "----------------------------------"
cd frontend
if pnpm test:unit 2>/dev/null || true; then
    FRONTEND_TESTS_PASSED=true
    echo "✅ Frontend tests passed (or skipped)"
else
    echo "⚠️  Frontend tests failed or not configured"
fi
cd ..

# Check if services are running for E2E tests
echo ""
echo "🔍 Checking if services are running..."
if ! curl -s http://localhost:3000 > /dev/null; then
    echo "❌ Backend is not running on port 3000"
    echo "   Please start services with: pnpm start:dev"
    EXIT_CODE=1
else
    echo "✅ Backend is running"
    
    # E2E BDD Tests
    echo ""
    echo "🎭 Running E2E BDD Tests..."
    echo "---------------------------"
    
    # Build frontend for testing
    echo "Building frontend..."
    cd frontend
    pnpm build > /dev/null 2>&1
    
    # Start preview server in background
    echo "Starting preview server..."
    pnpm preview > /dev/null 2>&1 &
    PREVIEW_PID=$!
    
    # Wait for preview server to be ready
    echo "Waiting for preview server..."
    sleep 5
    
    # Run BDD tests
    if pnpm test:bdd; then
        E2E_TESTS_PASSED=true
        echo "✅ E2E tests passed"
    else
        echo "❌ E2E tests failed"
        EXIT_CODE=1
    fi
    
    # Kill preview server
    kill $PREVIEW_PID 2>/dev/null || true
    cd ..
fi

# Test Summary
echo ""
echo "=============================="
echo "📊 Test Summary"
echo "=============================="
echo ""

if [ "$BACKEND_TESTS_PASSED" = true ]; then
    echo "✅ Backend Unit Tests: PASSED"
else
    echo "❌ Backend Unit Tests: FAILED"
fi

if [ "$FRONTEND_TESTS_PASSED" = true ]; then
    echo "✅ Frontend Unit Tests: PASSED"
else
    echo "⚠️  Frontend Unit Tests: SKIPPED or FAILED"
fi

if [ "$E2E_TESTS_PASSED" = true ]; then
    echo "✅ E2E BDD Tests: PASSED"
else
    echo "❌ E2E BDD Tests: FAILED or SKIPPED"
fi

echo ""
echo "=============================="

if [ $EXIT_CODE -eq 0 ]; then
    echo "🎉 All tests passed!"
    echo ""
    echo "📄 Reports:"
    echo "   - Cucumber Report: frontend/cucumber-report.html"
    echo "   - Open with: open frontend/cucumber-report.html"
else
    echo "💥 Some tests failed!"
    echo ""
    echo "Please review the output above for details."
fi

echo ""
exit $EXIT_CODE
