const windows = new Map();

function createRateLimiter({ windowMs, max, message }) {
  let requestsSinceCleanup = 0;

  return (req, res, next) => {
    const now = Date.now();
    const key = req.ip || req.socket.remoteAddress || "unknown";
    let entry = windows.get(key);

    if (!entry || now >= entry.resetAt) {
      entry = { count: 0, resetAt: now + windowMs };
      windows.set(key, entry);
    }

    entry.count += 1;
    requestsSinceCleanup += 1;

    if (requestsSinceCleanup >= 100) {
      for (const [address, value] of windows) {
        if (now >= value.resetAt) windows.delete(address);
      }
      requestsSinceCleanup = 0;
    }

    const remaining = Math.max(0, max - entry.count);
    res.setHeader("RateLimit-Limit", String(max));
    res.setHeader("RateLimit-Remaining", String(remaining));
    res.setHeader("RateLimit-Reset", String(Math.ceil(entry.resetAt / 1000)));

    if (entry.count > max) {
      res.setHeader("Retry-After", String(Math.max(1, Math.ceil((entry.resetAt - now) / 1000))));
      return res.status(429).json({ message });
    }

    return next();
  };
}

module.exports = { createRateLimiter };
