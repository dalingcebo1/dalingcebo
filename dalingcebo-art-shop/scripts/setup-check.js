#!/usr/bin/env node

/**
 * Setup verification script
 * Checks if the environment is properly configured before running the app
 */

import { existsSync, readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkEnvFile() {
  const envLocalPath = join(rootDir, '.env.local');
  const envExamplePath = join(rootDir, '.env.example');

  if (!existsSync(envLocalPath)) {
    log('\n❌ Missing .env.local file', 'red');
    log('\nThe application requires a .env.local file with your configuration.', 'yellow');
    log('\n📋 Quick Setup:', 'cyan');
    log('1. Copy the example file:', 'reset');
    log('   cp .env.example .env.local', 'blue');
    log('\n2. Edit .env.local with your Supabase credentials', 'reset');
    log('   Get them from: https://supabase.com/dashboard', 'blue');
    log('\n3. Run the setup check again:', 'reset');
    log('   npm run setup', 'blue');
    log('\n📖 For detailed instructions, see: SETUP-GUIDE.md\n', 'cyan');
    return false;
  }

  log('✅ .env.local file exists', 'green');
  return true;
}

function checkRequiredEnvVars() {
  const envLocalPath = join(rootDir, '.env.local');
  const envContent = readFileSync(envLocalPath, 'utf8');

  const requiredVars = {
    NEXT_PUBLIC_SUPABASE_URL: {
      name: 'Supabase URL',
      pattern: /^https:\/\/[a-zA-Z0-9-]+\.supabase\.co$/,
      placeholder: 'your_supabase_project_url',
    },
    NEXT_PUBLIC_SUPABASE_ANON_KEY: {
      name: 'Supabase Anon Key',
      pattern: /^eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/,
      placeholder: 'your_supabase_anon_key',
    },
    NEXTAUTH_SECRET: {
      name: 'NextAuth Secret',
      pattern: /^[A-Za-z0-9+/]{32,}={0,2}$/,
      placeholder: 'your-nextauth-secret-here',
    },
  };

  let allValid = true;
  const issues = [];

  for (const [varName, config] of Object.entries(requiredVars)) {
    // Escape special regex characters in variable name and match with multiline flag
    const escapedVarName = varName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const match = envContent.match(new RegExp(`^${escapedVarName}=(.*)$`, 'm'));
    
    if (!match) {
      issues.push(`❌ ${config.name} (${varName}) is not set`);
      allValid = false;
      continue;
    }

    const value = match[1].trim();

    if (!value || value === config.placeholder) {
      issues.push(`⚠️  ${config.name} is using placeholder value`);
      allValid = false;
    } else if (config.pattern && !config.pattern.test(value)) {
      issues.push(`⚠️  ${config.name} format looks incorrect`);
      allValid = false;
    } else {
      log(`✅ ${config.name} is configured`, 'green');
    }
  }

  if (!allValid) {
    log('\n⚠️  Environment Configuration Issues:', 'yellow');
    issues.forEach(issue => log(`   ${issue}`, 'yellow'));
    log('\n📋 To fix these issues:', 'cyan');
    log('1. Edit your .env.local file', 'reset');
    log('2. Replace placeholder values with real credentials', 'reset');
    log('3. Get Supabase credentials from: https://supabase.com/dashboard', 'blue');
    log('4. Generate NextAuth secret with: openssl rand -base64 32', 'blue');
    log('\n📖 See SETUP-GUIDE.md for detailed instructions\n', 'cyan');
    return false;
  }

  return true;
}

function checkDependencies() {
  const nodeModulesPath = join(rootDir, 'node_modules');
  
  if (!existsSync(nodeModulesPath)) {
    log('\n❌ Dependencies not installed', 'red');
    log('\nRun: npm install', 'blue');
    return false;
  }

  log('✅ Dependencies are installed', 'green');
  return true;
}

function main() {
  log('\n🔍 Checking Dalingcebo Art Shop Setup...\n', 'cyan');

  const checks = [
    checkDependencies(),
    checkEnvFile(),
  ];

  // Only check env vars if .env.local exists
  if (checks[1]) {
    checks.push(checkRequiredEnvVars());
  }

  if (checks.every(check => check)) {
    log('\n✨ Setup looks good! You can now run:', 'green');
    log('   npm run dev\n', 'blue');
    process.exit(0);
  } else {
    log('\n❌ Setup incomplete. Please fix the issues above.\n', 'red');
    process.exit(1);
  }
}

main();
