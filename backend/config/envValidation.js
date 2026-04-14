const requiredVars = [
  'MONGO_URI',
  'JWT_SECRET',
  'FRONTEND_URL'
];

const requiredInProduction = [
  'STRIPE_SECRET_KEY',
  'STRIPE_PUBLISHABLE_KEY',
  'STRIPE_WEBHOOK_SECRET',
  'EMAIL_USER',
  'EMAIL_PASS',
  'STORE_OWNER_EMAIL'
];

const placeholderPatterns = [
  /^your_/i,
  /placeholder/i,
  /changeme/i,
  /example\.com$/i,
  /mongodb:\/\/localhost/i
];

const isPlaceholderValue = (value) => {
  if (!value) return true;
  const normalized = String(value).trim();
  return placeholderPatterns.some((pattern) => pattern.test(normalized));
};

const validateEnvironment = ({ isProduction = process.env.NODE_ENV === 'production' } = {}) => {
  const missing = [];
  const invalid = [];

  const varsToCheck = [...requiredVars, ...(isProduction ? requiredInProduction : [])];

  for (const varName of varsToCheck) {
    const value = process.env[varName];
    if (!value) {
      missing.push(varName);
      continue;
    }

    if (isProduction && isPlaceholderValue(value)) {
      invalid.push(varName);
    }
  }

  return {
    ok: missing.length === 0 && invalid.length === 0,
    missing,
    invalid
  };
};

module.exports = {
  validateEnvironment
};
