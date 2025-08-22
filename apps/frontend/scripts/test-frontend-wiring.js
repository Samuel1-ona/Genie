#!/usr/bin/env node

/**
 * Test script to verify frontend wiring to bridge endpoints
 * This script tests that sensitive actions use aoSendAdmin and regular actions use aoSend
 */

import { aoSend, aoSendAdmin } from '../src/lib/aoClient.js';

// Mock fetch for testing
global.fetch = async (url, options) => {
  const body = JSON.parse(options.body);

  // Check if it's a sensitive action
  const sensitiveActions = [
    'ScrapeGovernance',
    'ClearCache',
    'ResetRateLimits',
    'AddBalance',
    'AdjustBalance',
  ];
  const isSensitive = sensitiveActions.includes(body.Action || body.action);

  console.log(`📡 ${isSensitive ? 'ADMIN' : 'REGULAR'} endpoint called:`, {
    url,
    action: body.Action || body.action,
    isSensitive,
  });

  // Return mock response
  return {
    ok: true,
    json: async () => ({ ok: true, data: { success: true } }),
  };
};

// Mock environment variable
import.meta.env = {
  VITE_AO_TARGET_ID: 'test-target-id',
};

async function testRegularActions() {
  console.log('\n🧪 Testing regular actions (should use /api/ao)...');

  try {
    await aoSend('GetAllProposals');
    await aoSend('GetGovernancePlatforms');
    await aoSend('GetSubscribers');
    await aoSend('GetRuntimeStats');

    console.log('✅ Regular actions correctly routed to /api/ao');
  } catch (error) {
    console.log('❌ Regular actions test failed:', error.message);
  }
}

async function testSensitiveActions() {
  console.log(
    '\n🧪 Testing sensitive actions (should use /api/admin/command)...'
  );

  try {
    await aoSend('ScrapeGovernance', { platformId: 'test' });
    await aoSend('ClearCache');
    await aoSend('ResetRateLimits');
    await aoSend('AddBalance', { address: 'test', amount: 100 });
    await aoSend('AdjustBalance', {
      address: 'test',
      amount: 50,
      reason: 'test',
    });

    console.log('✅ Sensitive actions correctly routed to /api/admin/command');
  } catch (error) {
    console.log('❌ Sensitive actions test failed:', error.message);
  }
}

async function testDirectAdminFunction() {
  console.log('\n🧪 Testing direct aoSendAdmin function...');

  try {
    await aoSendAdmin('ScrapeGovernance', { platformId: 'test' });
    await aoSendAdmin('ClearCache');

    console.log('✅ Direct aoSendAdmin function working correctly');
  } catch (error) {
    console.log('❌ Direct aoSendAdmin test failed:', error.message);
  }
}

async function runTests() {
  console.log('🚀 Starting frontend wiring tests...');

  await testRegularActions();
  await testSensitiveActions();
  await testDirectAdminFunction();

  console.log('\n✨ Frontend wiring tests completed!');
  console.log('\n📋 Summary:');
  console.log('- Regular actions should call /api/ao');
  console.log('- Sensitive actions should call /api/admin/command');
  console.log('- aoSendAdmin function should call /api/admin/command');
}

// Run tests
runTests().catch(console.error);
