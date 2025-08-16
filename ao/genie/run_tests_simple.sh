#!/bin/bash

# Simple test runner for Genie-Proposal-Summarizer
echo "🧪 Running Genie-Proposal-Summarizer Tests"
echo "=========================================="

# Check if we're in the right directory
if [ ! -f "src/test/proposals_test.lua" ]; then
    echo "❌ Error: Please run this script from the Genie project root directory"
    echo "   Current directory: $(pwd)"
    echo "   Expected files: src/test/proposals_test.lua"
    exit 1
fi

# Check if busted is installed
if ! command -v busted &> /dev/null; then
    echo "❌ Error: busted is not installed"
    echo "   Install it with: luarocks install busted"
    exit 1
fi

echo "✅ Found test files"
echo "✅ busted is installed"
echo ""

# Run tests with summary
echo "📊 Running all tests..."
busted src/test --pattern "_test" 2>&1 | grep -E "(successes|failures|errors|pending|seconds)"

echo ""
echo "📋 Test Summary:"
echo "   - Run individual tests with: busted src/test/proposals_test.lua"
echo "   - Run with verbose output: busted src/test --pattern '_test' --verbose"
echo "   - Check specific module: busted src/test/notification_system_test.lua"
