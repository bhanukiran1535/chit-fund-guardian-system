
const requiredEnvVars = [
  'MONGODB_URI',
  'JWT_SECRET',
  'MAIL_USER',
  'MAIL_PASS'
];

function validateEnvironment() {
  const missing = requiredEnvVars.filter(envVar => !process.env[envVar]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
    throw new Error('JWT_SECRET must be at least 32 characters long');
  }
}

module.exports = { validateEnvironment };
