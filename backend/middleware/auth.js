const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

// Simple in-memory cache to avoid calling Supabase auth.getUser() on every API request
// Maps token -> { user, expiresAt }
const authCache = new Map();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid Authorization header' });
  }

  const token = authHeader.split(' ')[1];

  try {
    // We create a fresh client for this request to apply RLS
    const reqSupabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
      global: {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    });

    let user = null;
    const now = Date.now();
    
    // Check cache
    if (authCache.has(token)) {
      const cached = authCache.get(token);
      if (now < cached.expiresAt) {
        user = cached.user;
      } else {
        authCache.delete(token);
      }
    }

    // If not in cache or expired, fetch from Supabase
    if (!user) {
      const { data, error } = await reqSupabase.auth.getUser();
      if (error || !data.user) {
        return res.status(401).json({ error: 'Unauthorized: Invalid token' });
      }
      user = data.user;
      
      // Save to cache
      authCache.set(token, {
        user,
        expiresAt: now + CACHE_TTL_MS
      });
      
      // Cleanup cache occasionally to prevent memory leaks
      if (authCache.size > 1000) {
        const oldestKeys = Array.from(authCache.keys()).slice(0, 100);
        oldestKeys.forEach(k => authCache.delete(k));
      }
    }

    req.user = user;
    req.supabase = reqSupabase; // Use this localized client for all DB calls
    
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ error: 'Internal server error during authentication' });
  }
};

module.exports = authMiddleware;
