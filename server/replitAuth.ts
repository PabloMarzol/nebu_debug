import * as client from "openid-client";
import { Strategy, type VerifyFunction } from "openid-client/passport";

import passport from "passport";
import session from "express-session";
import type { Express, RequestHandler } from "express";
import memoize from "memoizee";
import connectPg from "connect-pg-simple";
import { storage } from "./storage";

if (!process.env.REPLIT_DOMAINS) {
  throw new Error("Environment variable REPLIT_DOMAINS not provided");
}

const getOidcConfig = memoize(
  async () => {
    return await client.discovery(
      new URL(process.env.ISSUER_URL ?? "https://replit.com/oidc"),
      process.env.REPL_ID!
    );
  },
  { maxAge: 3600 * 1000 }
);

export function getSession() {
  const sessionTtl = 30 * 24 * 60 * 60 * 1000; // 30 days for better user experience
  const isProduction = process.env.NODE_ENV === 'production';
  
  // Use memory store for development to avoid database connection issues
  if (!isProduction || !process.env.DATABASE_URL) {
    console.log('[Session] Using memory store for development');
    return session({
      secret: process.env.SESSION_SECRET || 'fallback-secret-for-development',
      resave: false,
      saveUninitialized: false,
      rolling: true, // Reset session expiry on each request
      cookie: {
        httpOnly: true,
        secure: false, // Set to false for development
        maxAge: sessionTtl,
        sameSite: 'lax', // Better cross-site compatibility
      },
    });
  }
  
  // Use PostgreSQL store for production
  try {
    const pgStore = connectPg(session);
    const sessionStore = new pgStore({
      conString: process.env.DATABASE_URL,
      createTableIfMissing: true,
      ttl: sessionTtl,
      tableName: "sessions",
    });
    
    console.log('[Session] Using PostgreSQL session store');
    return session({
      secret: process.env.SESSION_SECRET || 'fallback-secret-for-development',
      store: sessionStore,
      resave: false,
      saveUninitialized: false,
      rolling: true, // Reset session expiry on each request
      cookie: {
        httpOnly: true,
        secure: true,
        maxAge: sessionTtl,
        sameSite: 'strict', // Better security in production
      },
    });
  } catch (error) {
    console.warn('[Session] Database session store failed, falling back to memory store:', error instanceof Error ? error.message : String(error));
    return session({
      secret: process.env.SESSION_SECRET || 'fallback-secret-for-development',
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        secure: false,
        maxAge: sessionTtl,
      },
    });
  }
}

function updateUserSession(
  user: any,
  tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers
) {
  user.claims = tokens.claims();
  user.access_token = tokens.access_token;
  user.refresh_token = tokens.refresh_token;
  user.expires_at = user.claims?.exp;
}

async function upsertUser(
  claims: any,
) {
  await storage.upsertUser({
    id: claims["sub"],
    email: claims["email"],
    firstName: claims["first_name"],
    lastName: claims["last_name"],
    profileImageUrl: claims["profile_image_url"],
  });
}

export async function setupAuth(app: Express) {
  try {
    console.log('[Auth] Setting up authentication...');
    
    app.set("trust proxy", 1);
    app.use(getSession());
    app.use(passport.initialize());
    app.use(passport.session());

    // Check required environment variables
    if (!process.env.REPLIT_DOMAINS) {
      throw new Error('REPLIT_DOMAINS environment variable is required');
    }
    
    if (!process.env.REPL_ID) {
      console.warn('[Auth] REPL_ID not found, using fallback configuration');
    }

    const config = await getOidcConfig();
    console.log('[Auth] OIDC config loaded successfully');

    const verify: VerifyFunction = async (
      tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers,
      verified: passport.AuthenticateCallback
    ) => {
      try {
        const user: any = {};
        updateUserSession(user, tokens);
        await upsertUser(tokens.claims());
        verified(null, user);
      } catch (error) {
        console.error('[Auth] User verification failed:', error);
        verified(error, null);
      }
    };

    const domains = process.env.REPLIT_DOMAINS.split(",");
    console.log(`[Auth] Setting up authentication for domains: ${domains.join(', ')}`);

    for (const domain of domains) {
      try {
        const strategy = new Strategy(
          {
            name: `replitauth:${domain}`,
            config,
            scope: "openid email profile offline_access",
            callbackURL: `https://${domain}/api/callback`,
          },
          verify,
        );
        passport.use(strategy);
        console.log(`[Auth] Strategy configured for domain: ${domain}`);
      } catch (error) {
        console.error(`[Auth] Failed to configure strategy for domain ${domain}:`, error);
      }
    }

    passport.serializeUser((user: any, cb) => cb(null, user));
    passport.deserializeUser((user: any, cb) => cb(null, user));

    // Auth routes
    app.get("/api/login", (req, res, next) => {
      try {
        passport.authenticate(`replitauth:${req.hostname}`, {
          prompt: "login consent",
          scope: ["openid", "email", "profile", "offline_access"],
        })(req, res, next);
      } catch (error) {
        console.error('[Auth] Login error:', error);
        res.status(500).json({ message: "Authentication service error" });
      }
    });

    app.get("/api/callback", (req, res, next) => {
      try {
        passport.authenticate(`replitauth:${req.hostname}`, {
          successReturnToOrRedirect: "/",
          failureRedirect: "/api/login",
        })(req, res, next);
      } catch (error) {
        console.error('[Auth] Callback error:', error);
        res.redirect("/api/login");
      }
    });

    app.get("/api/logout", (req, res) => {
      try {
        req.logout(() => {
          res.redirect(
            client.buildEndSessionUrl(config, {
              client_id: process.env.REPL_ID!,
              post_logout_redirect_uri: `${req.protocol}://${req.hostname}`,
            }).href
          );
        });
      } catch (error) {
        console.error('[Auth] Logout error:', error);
        res.redirect("/");
      }
    });

    console.log('[Auth] Authentication setup completed successfully');
  } catch (error) {
    console.error('[Auth] Failed to setup authentication:', error);
    
    // Setup minimal session middleware at least
    try {
      app.use(getSession());
      console.log('[Auth] Fallback session middleware configured');
    } catch (sessionError) {
      console.error('[Auth] Failed to setup even basic session middleware:', sessionError);
    }
    
    throw error; // Re-throw to allow calling code to handle
  }
}

export const isAuthenticated: RequestHandler = async (req, res, next) => {
  try {
    // Always allow in development to prevent system crashes
    const isDevelopment = process.env.NODE_ENV !== 'production';
    
    if (isDevelopment) {
      // In development, just log and continue to prevent blocking the system
      console.log('[Auth] Development mode - bypassing authentication checks');
      return next();
    }

    // Check if passport is initialized and authentication methods are available
    if (!req.isAuthenticated) {
      return res.status(401).json({ message: "Authentication not configured" });
    }

    const user = req.user as any;

    // Check if user is authenticated
    if (!req.isAuthenticated() || !user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Check token expiration if available
    if (user.expires_at) {
      const now = Math.floor(Date.now() / 1000);
      if (now <= user.expires_at) {
        return next();
      }

      // Try to refresh token
      const refreshToken = user.refresh_token;
      if (!refreshToken) {
        return res.status(401).json({ message: "Token expired" });
      }

      try {
        const config = await getOidcConfig();
        const tokenResponse = await client.refreshTokenGrant(config, refreshToken);
        updateUserSession(user, tokenResponse);
        return next();
      } catch (error) {
        return res.status(401).json({ message: "Token refresh failed" });
      }
    }

    return next();
  } catch (error) {
    console.error('[Auth] Authentication error:', error);
    // In case of any authentication errors, allow continuation in development
    const isDevelopment = process.env.NODE_ENV !== 'production';
    if (isDevelopment) {
      console.warn('[Auth] Error in authentication, continuing in development mode');
      return next();
    }
    return res.status(500).json({ message: "Authentication service error" });
  }
};