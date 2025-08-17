#!/usr/bin/env node

/**
 * Test script for AO Bridge functionality
 * Run with: node scripts/test-ao-bridge.js
 */

const fetch = require('node-fetch');

const TEST_ENDPOINT = 'http://localhost:5173/api/ao';

async function testAOBridge() {
  console.log('🧪 Testing AO Bridge...\n');

  const testCases = [
    {
      name: 'Valid Info request',
      payload: {
        Target: 'test-agent-id',
        Action: 'Info',
        Data: null,
        Tags: {},
      },
    },
    {
      name: 'Valid GetAllProposals request',
      payload: {
        Target: 'test-agent-id',
        Action: 'GetAllProposals',
        Data: null,
        Tags: {},
      },
    },
    {
      name: 'Invalid action (should be blocked)',
      payload: {
        Target: 'test-agent-id',
        Action: 'InvalidAction',
        Data: null,
        Tags: {},
      },
    },
    {
      name: 'Missing Target (should fail)',
      payload: {
        Action: 'Info',
        Data: null,
        Tags: {},
      },
    },
  ];

  for (const testCase of testCases) {
    console.log(`📋 Testing: ${testCase.name}`);

    try {
      const response = await fetch(TEST_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testCase.payload),
      });

      const result = await response.json();

      console.log(`   Status: ${response.status}`);
      console.log(`   Response:`, JSON.stringify(result, null, 2));

      if (response.ok && result.ok) {
        console.log('   ✅ SUCCESS\n');
      } else {
        console.log('   ❌ FAILED\n');
      }
    } catch (error) {
      console.log(`   ❌ ERROR: ${error.message}\n`);
    }
  }

  console.log('🏁 AO Bridge test completed!');
}

// Check if server is running
async function checkServer() {
  try {
    const response = await fetch('http://localhost:5173');
    if (response.ok) {
      console.log('✅ Development server is running');
      return true;
    }
  } catch (error) {
    console.log('❌ Development server is not running');
    console.log('   Please start it with: npm run dev');
    return false;
  }
}

async function main() {
  const serverRunning = await checkServer();
  if (serverRunning) {
    await testAOBridge();
  }
}

main().catch(console.error);
