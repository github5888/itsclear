/**
 * In-memory sliding window rate limiter for OTP endpoints
 * Handles reverse proxy IP extraction (X-Forwarded-For) defensively
 */

const ipRequests = new Map();

// Cleanup stale IP entries every 10 minutes
setInterval(() => {
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutes
  for (const [ip, timestamps] of ipRequests.entries()) {
    const valid = timestamps.filter(t => now - t < windowMs);
    if (valid.length === 0) {
      ipRequests.delete(ip);
    } else {
      ipRequests.set(ip, valid);
    }
  }
}, 10 * 60 * 1000).unref();

/**
 * Extract client IP defensively from request, accounting for aaPanel/Nginx reverse proxies
 */
function getClientIp(req) {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    const ips = typeof forwarded === 'string' ? forwarded.split(',') : forwarded;
    const clientIp = ips[0].trim();
    if (clientIp) return clientIp;
  }
  return req.ip || req.connection?.remoteAddress || '127.0.0.1';
}

/**
 * Check and record IP rate limit for OTP requests
 * Limit: 10 requests per 15 minutes per IP
 */
function checkIpRateLimit(req, maxLimit = 10, windowMs = 15 * 60 * 1000) {
  if (process.env.NODE_ENV === 'test') {
    return { allowed: true, ip: '127.0.0.1' };
  }
  const ip = getClientIp(req);
  const now = Date.now();
  const timestamps = ipRequests.get(ip) || [];

  // Filter timestamps within current window
  const activeTimestamps = timestamps.filter(t => now - t < windowMs);

  if (activeTimestamps.length >= maxLimit) {
    const oldest = activeTimestamps[0];
    const retryAfterSeconds = Math.ceil((windowMs - (now - oldest)) / 1000);
    return {
      allowed: false,
      retryAfterSeconds,
      ip
    };
  }

  // Record this request
  activeTimestamps.push(now);
  ipRequests.set(ip, activeTimestamps);

  return {
    allowed: true,
    ip
  };
}

module.exports = {
  getClientIp,
  checkIpRateLimit
};
