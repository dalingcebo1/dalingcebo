#!/usr/bin/env node

/**
 * Production Readiness Verification Script
 * 
 * This script checks if all required environment variables are set
 * and performs basic validation of the production setup.
 */

const fs = require('fs');
const path = require('path');

const REQUIRED_VARS = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
  'STRIPE_SECRET_KEY',
  'STRIPE_WEBHOOK_SECRET',
  'RESEND_API_KEY',
  'NEXT_PUBLIC_BASE_URL',
];

const OPTIONAL_VARS = [
  'NEXT_PUBLIC_YOCO_PUBLIC_KEY',
  'YOCO_SECRET_KEY',
  'YOCO_WEBHOOK_SECRET',
  'NEXT_PUBLIC_GOOGLE_CLIENT_ID',
  'EMAIL_FROM',
  'NEXT_PUBLIC_ADMIN_KEY',
];

console.log('🔍 Checking Production Readiness...\n');

let hasErrors = false;
let hasWarnings = false;

// Check if .env.local exists
const envPath = path.join(process.cwd(), '.env.local');
if (!fs.existsSync(envPath)) {
  console.error('❌ .env.local file not found');
  console.error('   Create one by copying .env.example: cp .env.example .env.local\n');
  hasErrors = true;
}

// Load environment variables
require('dotenv').config({ path: envPath });

// Check required variables
console.log('📋 Required Environment Variables:');
REQUIRED_VARS.forEach(varName => {
  if (!process.env[varName]) {
    console.error(`   ❌ ${varName} - NOT SET`);
    hasErrors = true;
  } else {
    const value = process.env[varName];
    const displayValue = value.length > 20 ? value.substring(0, 20) + '...' : value;
    console.log(`   ✅ ${varName} - SET (${displayValue})`);
  }
});

console.log('\n📋 Optional Environment Variables:');
OPTIONAL_VARS.forEach(varName => {
  if (!process.env[varName]) {
    console.warn(`   ⚠️  ${varName} - NOT SET (optional)`);
    hasWarnings = true;
  } else {
    const value = process.env[varName];
    const displayValue = value.length > 20 ? value.substring(0, 20) + '...' : value;
    console.log(`   ✅ ${varName} - SET (${displayValue})`);
  }
});

// Validate URL formats
console.log('\n🔗 URL Validation:');
if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
  try {
    new URL(process.env.NEXT_PUBLIC_SUPABASE_URL);
    console.log('   ✅ Supabase URL format valid');
  } catch {
    console.error('   ❌ Supabase URL format invalid');
    hasErrors = true;
  }
}

if (process.env.NEXT_PUBLIC_BASE_URL) {
  try {
    new URL(process.env.NEXT_PUBLIC_BASE_URL);
    const url = new URL(process.env.NEXT_PUBLIC_BASE_URL);
    if (url.protocol !== 'https:' && process.env.NODE_ENV === 'production') {
      console.warn('   ⚠️  Base URL should use HTTPS in production');
      hasWarnings = true;
    } else {
      console.log('   ✅ Base URL format valid');
    }
  } catch {
    console.error('   ❌ Base URL format invalid');
    hasErrors = true;
  }
}

// Check key prefixes
console.log('\n🔑 API Key Format Validation:');
if (process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
  if (process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY.startsWith('pk_')) {
    console.log('   ✅ Stripe publishable key format valid');
  } else {
    console.error('   ❌ Stripe publishable key should start with pk_');
    hasErrors = true;
  }
}

if (process.env.STRIPE_SECRET_KEY) {
  if (process.env.STRIPE_SECRET_KEY.startsWith('sk_')) {
    console.log('   ✅ Stripe secret key format valid');
  } else {
    console.error('   ❌ Stripe secret key should start with sk_');
    hasErrors = true;
  }
}

// Check file structure
console.log('\n📁 File Structure:');
const requiredFiles = [
  'package.json',
  'next.config.ts',
  '.env.example',
  'DEPLOYMENT.md',
  'PRODUCTION-CHECKLIST.md',
  'README.md',
];

requiredFiles.forEach(file => {
  if (fs.existsSync(path.join(process.cwd(), file))) {
    console.log(`   ✅ ${file} exists`);
  } else {
    console.error(`   ❌ ${file} missing`);
    hasErrors = true;
  }
});

// Check if node_modules exists
if (!fs.existsSync(path.join(process.cwd(), 'node_modules'))) {
  console.error('   ❌ node_modules missing - run: npm install');
  hasErrors = true;
} else {
  console.log('   ✅ node_modules exists');
}

// Final summary
console.log('\n' + '='.repeat(50));
if (hasErrors) {
  console.error('\n❌ Production readiness check FAILED');
  console.error('   Please fix the errors above before deploying.\n');
  process.exit(1);
} else if (hasWarnings) {
  console.warn('\n⚠️  Production readiness check passed with WARNINGS');
  console.warn('   Review the warnings above. You may proceed but should address them.\n');
  process.exit(0);
} else {
  console.log('\n✅ Production readiness check PASSED');
  console.log('   All checks completed successfully. Ready for deployment!\n');
  process.exit(0);
}
