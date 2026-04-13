// backend/src/middleware/logger.js
const Log = require('../models/Log');

function logAction(action, resource) {
  return async (req, res, next) => {
    res.on('finish', async () => {
      try {
        await Log.create({
          userId: req.user?.id || null,
          userEmail: req.user?.email || 'anonymous',
          action,
          resource,
          resourceId: req.params?.id || null,
          details: { method: req.method, path: req.path, statusCode: res.statusCode, body: req.body },
          ip: req.ip,
          userAgent: req.get('User-Agent'),
        });
      } catch (err) {
        // Logging should never break the app
      }
    });
    next();
  };
}

module.exports = { logAction };
