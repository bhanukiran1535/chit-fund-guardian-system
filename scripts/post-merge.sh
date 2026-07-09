#!/bin/bash
set -e

echo "=== Post-merge setup ==="

echo "Installing root dependencies..."
npm install --legacy-peer-deps 2>&1 | tail -5

echo "Installing frontend dependencies..."
cd frontend && npm install --legacy-peer-deps 2>&1 | tail -5 && cd ..

echo "Installing backend dependencies..."
cd Backend && npm install 2>&1 | tail -5 && cd ..

echo "=== Post-merge setup complete ==="
