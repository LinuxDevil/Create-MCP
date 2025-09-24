#!/usr/bin/env node

const { run } = require('../lib/index.js');

run().catch((error) => {
  console.error('Unexpected error:', error);
  process.exit(1);
});