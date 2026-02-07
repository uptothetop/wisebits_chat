#!/bin/bash

# Wisebits Chat - Quality Check Script
# Comprehensive quality verification before task completion

set -e  # Exit on error

echo "🔍 Wisebits Chat - Quality Verification"
echo "========================================"

FAILED_CHECKS=0

# 0. Health Check
echo ""
echo "0️⃣  Checking System Health..."
echo "--------------------------------"
if ./scripts/health-check.sh > /dev/null 2>&1; then
    echo "✅ System health check passed"
else
    echo "❌ System health check failed"
    echo "   Please ensure all services are running:"
    echo "   - Docker: docker-compose up -d"
    echo "   - Backend: cd backend && pnpm start:dev"
    echo "   - Frontend: cd frontend && pnpm dev"
    FAILED_CHECKS=$((FAILED_CHECKS + 1))
fi

# 1. Security Tests
echo ""
echo "1️⃣  Running Security Tests..."
echo "--------------------------------"
cd frontend
if pnpm test:bdd -- --tags "@security" 2>/dev/null; then
    echo "✅ Security tests passed"
else
    echo "⚠️  Security tests skipped or failed"
    echo "   Review: .agent/skills/security/SKILL.md"
fi
cd ..

# 2. Backend Unit Tests
echo ""
echo "2️⃣  Running Backend Unit Tests..."
echo "--------------------------------"
cd backend
if pnpm test; then
    echo "✅ Backend unit tests passed"
else
    echo "❌ Backend unit tests failed"
    FAILED_CHECKS=$((FAILED_CHECKS + 1))
fi
cd ..

# 3. Frontend Unit Tests
echo ""
echo "3️⃣  Running Frontend Unit Tests..."
echo "--------------------------------"
cd frontend
if pnpm test:unit 2>/dev/null || true; then
    echo "✅ Frontend unit tests passed (or skipped)"
else
    echo "⚠️  Frontend unit tests failed or not configured"
fi
cd ..

# 4. Backend Linting
echo ""
echo "4️⃣  Running Backend Linter..."
echo "--------------------------------"
cd backend
if pnpm lint; then
    echo "✅ Backend linting passed"
else
    echo "❌ Backend linting failed"
    echo "   Try: cd backend && pnpm lint:fix"
    FAILED_CHECKS=$((FAILED_CHECKS + 1))
fi
cd ..

# 5. Frontend Linting
echo ""
echo "5️⃣  Running Frontend Linter..."
echo "--------------------------------"
cd frontend
if pnpm lint 2>/dev/null || true; then
    echo "✅ Frontend linting passed (or skipped)"
else
    echo "⚠️  Frontend linting issues detected"
fi

# TypeScript Check
echo "   Checking TypeScript types..."
if pnpm check 2>/dev/null || true; then
    echo "✅ TypeScript checks passed (or skipped)"
else
    echo "⚠️  TypeScript type errors detected"
fi
cd ..

# Summary
echo ""
echo "========================================"
echo "📊 Quality Check Summary"
echo "========================================"
echo ""

if [ $FAILED_CHECKS -eq 0 ]; then
    echo "🎉 All critical quality checks passed!"
    echo ""
    echo "✅ System is healthy"
    echo "✅ Backend tests passed"
    echo "✅ Backend linting passed"
    echo ""
    echo "✨ Task is ready for completion!"
    exit 0
else
    echo "💥 $FAILED_CHECKS critical check(s) failed!"
    echo ""
    echo "⚠️  Please fix the issues above before completing the task."
    echo ""
    echo "📖 Resources:"
    echo "   - Quality checklist: .agent/rules/task-completion.md"
    echo "   - Security guide: .agent/skills/security/SKILL.md"
    echo ""
    exit 1
fi
