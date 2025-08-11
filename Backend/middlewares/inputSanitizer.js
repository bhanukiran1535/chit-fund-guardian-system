const validator = require('validator');

const sanitizeInput = (req, res, next) => {
  // Sanitize string inputs to prevent XSS
  const sanitizeObject = (obj) => {
    for (let key in obj) {
      if (typeof obj[key] === 'string') {
        // Escape HTML to prevent XSS
        obj[key] = validator.escape(obj[key]);
        // Remove potential SQL injection patterns (for NoSQL injection prevention)
        obj[key] = obj[key].replace(/[{}\[\]$]/g, '');
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        sanitizeObject(obj[key]);
      }
    }
  };

  if (req.body) {
    sanitizeObject(req.body);
  }
  
  if (req.query) {
    sanitizeObject(req.query);
  }
  
  if (req.params) {
    sanitizeObject(req.params);
  }

  next();
};

module.exports = sanitizeInput;