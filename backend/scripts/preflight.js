const dotenv = require('dotenv');
const path = require('path');
const { validateEnvironment } = require('../config/envValidation');

dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const result = validateEnvironment({ isProduction: true });

if (!result.ok) {
  console.error('\nEnvironment preflight failed.');

  if (result.missing.length > 0) {
    console.error(`Missing required vars: ${result.missing.join(', ')}`);
  }

  if (result.invalid.length > 0) {
    console.error(`Invalid placeholder vars: ${result.invalid.join(', ')}`);
  }

  process.exit(1);
}

console.log('Environment preflight passed.');
