#!/usr/bin/env node

/**
 * Test script to verify admin gating functionality
 * This script tests both the regular AO bridge and admin command endpoints
 */

import crypto from 'crypto';

// Configuration
const BASE_URL = process.env.BASE_URL || 'http://localhost:5173';
const ADMIN_HMAC_SECRET = process.env.ADMIN_HMAC_SECRET || 'test-secret';

// Test data
const testPayload = {
  Target: 'test-target',
  Action: 'GetAllProposals',
  Data: JSON.stringify({ test: true }),
  Tags: { 'Request-Id': 'test-123' },
};

const sensitivePayload = {
  Target: 'test-target',
  Action: 'ClearCache',
  Data: JSON.stringify({ test: true }),
  Tags: { 'Request-Id': 'test-456' },
};

/**
 * Generate HMAC signature for admin action
 */
function generateAdminSignature(action) {
  const ts = Date.now().toString();
  const payload = `${action}:${ts}`;
  const sig = crypto
    .createHmac('sha256', ADMIN_HMAC_SECRET)
    .update(payload)
    .digest('hex');
  return { sig, ts };
}

/**
 * Test regular AO bridge endpoint
 */
async function testRegularBridge() {
  console.log('\n🧪 Testing regular AO bridge endpoint...');

  try {
    const response = await fetch(`${BASE_URL}/api/ao`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testPayload),
    });

    console.log(`Status: ${response.status}`);
    const data = await response.json();
    console.log('Response:', JSON.stringify(data, null, 2));

    if (response.status === 200) {
      console.log('✅ Regular bridge endpoint working');
    } else {
      console.log('❌ Regular bridge endpoint failed');
    }
  } catch (error) {
    console.log('❌ Regular bridge endpoint error:', error.message);
  }
}

/**
 * Test sensitive action without admin auth (should fail)
 */
async function testSensitiveActionWithoutAuth() {
  console.log('\n🧪 Testing sensitive action without admin auth...');

  try {
    const response = await fetch(`${BASE_URL}/api/ao`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(sensitivePayload),
    });

    console.log(`Status: ${response.status}`);
    const data = await response.json();
    console.log('Response:', JSON.stringify(data, null, 2));

    if (response.status === 401) {
      console.log('✅ Sensitive action correctly blocked without auth');
    } else {
      console.log('❌ Sensitive action should have been blocked');
    }
  } catch (error) {
    console.log('❌ Sensitive action test error:', error.message);
  }
}

/**
 * Test admin command endpoint
 */
async function testAdminCommand() {
  console.log('\n🧪 Testing admin command endpoint...');

  try {
    const adminPayload = {
      action: 'ClearCache',
      data: { test: true },
      tags: { 'Request-Id': 'test-789' },
    };

    const response = await fetch(`${BASE_URL}/api/admin/command`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(adminPayload),
    });

    console.log(`Status: ${response.status}`);
    const data = await response.json();
    console.log('Response:', JSON.stringify(data, null, 2));

    if (response.status === 200) {
      console.log('✅ Admin command endpoint working');
    } else {
      console.log('❌ Admin command endpoint failed');
    }
  } catch (error) {
    console.log('❌ Admin command endpoint error:', error.message);
  }
}

/**
 * Test non-sensitive action in admin command (should fail)
 */
async function testNonSensitiveInAdminCommand() {
  console.log('\n🧪 Testing non-sensitive action in admin command...');

  try {
    const adminPayload = {
      action: 'GetAllProposals',
      data: { test: true },
      tags: { 'Request-Id': 'test-101' },
    };

    const response = await fetch(`${BASE_URL}/api/admin/command`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(adminPayload),
    });

    console.log(`Status: ${response.status}`);
    const data = await response.json();
    console.log('Response:', JSON.stringify(data, null, 2));

    if (response.status === 400) {
      console.log(
        '✅ Non-sensitive action correctly rejected in admin command'
      );
    } else {
      console.log('❌ Non-sensitive action should have been rejected');
    }
  } catch (error) {
    console.log('❌ Non-sensitive action test error:', error.message);
  }
}

/**
 * Run all tests
 */
async function runTests() {
  console.log('🚀 Starting admin gating tests...');
  console.log(`Base URL: ${BASE_URL}`);
  console.log(
    `Admin HMAC Secret: ${ADMIN_HMAC_SECRET ? 'Configured' : 'Not configured'}`
  );

  await testRegularBridge();
  await testSensitiveActionWithoutAuth();
  await testAdminCommand();
  await testNonSensitiveInAdminCommand();

  console.log('\n✨ Admin gating tests completed!');
}

// Run tests if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runTests().catch(console.error);
}

export {
  testRegularBridge,
  testSensitiveActionWithoutAuth,
  testAdminCommand,
  testNonSensitiveInAdminCommand,
  runTests,
};
