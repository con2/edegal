/**
 * Environment registry. Every process.env read in the app goes through here so the
 * deployment chart and this file are the only two places that know variable names.
 */

// `next build` imports these modules to collect page data with NODE_ENV=production but without
// the deployment's secrets; only a running server or worker must have them.
const production =
  process.env.NODE_ENV === "production" &&
  process.env.NEXT_PHASE !== "phase-production-build";

function env(name: string, fallback: string): string {
  return process.env[name] || fallback;
}

/**
 * Development gets a working default; production must set the variable. Booting with a
 * default secret would let anyone forge sessions, and a default database URL would silently
 * point production at nothing, so the process refuses to start instead.
 */
function secretEnv(name: string, devFallback: string): string {
  const value = process.env[name];
  if (value) return value;
  if (production) throw new Error(`${name} must be set in production`);
  return devFallback;
}

export const databaseUrl = secretEnv(
  "DATABASE_URL",
  "postgresql://edegal:photos@localhost:5432/edegal",
);
export const testDatabaseUrl = env(
  "TEST_DATABASE_URL",
  "postgresql://edegal:photos@localhost:5432/edegal_test",
);

export const mediaRoot = env("MEDIA_ROOT", "./media");
/** URL prefix under which media storage keys are served, without trailing slash. */
export const mediaBaseUrl = env("MEDIA_BASE_URL", "/media").replace(/\/$/, "");

export const publicUrl = env("NEXTAUTH_URL", "http://localhost:3160");
export const authSecret = secretEnv("AUTH_SECRET", "insecure-dev-secret");

export const kompassiBaseUrl = env(
  "KOMPASSI_BASE_URL",
  "https://dev.kompassi.eu",
);
export const kompassiOidc = {
  wellKnown: `${kompassiBaseUrl}/oidc/.well-known/openid-configuration/`,
  clientId: secretEnv(
    "KOMPASSI_OIDC_CLIENT_ID",
    "kompassi-dev-client-id-uusi-larppikuvat-fi",
  ),
  clientSecret: secretEnv(
    "KOMPASSI_OIDC_CLIENT_SECRET",
    "kompassi-dev-client-secret-uusi-larppikuvat-fi-insecure",
  ),
};
/** Kompassi group names granting photographer and admin privileges. */
export const photographerGroup = env("PHOTOGRAPHER_GROUP", "larppikuvat-staff");
export const adminGroup = env("ADMIN_GROUP", "admins");

/** Legacy Django content in the same database. Off for a clean install. */
export const legacyEnabled = env("LEGACY_ENABLED", "true") !== "false";
export const legacyAdminUrl = env(
  "LEGACY_ADMIN_URL",
  "https://larppikuvat.fi/admin/",
).replace(/\/?$/, "/");

export const timezone = "Europe/Helsinki";

/** Outgoing mail, larpit-fi style: no host means messages are logged in development and refused in production. */
export const smtp = {
  host: env("SMTP_HOSTNAME", ""),
  port: Number(env("SMTP_PORT", "587")),
  username: env("SMTP_USERNAME", ""),
  password: env("SMTP_PASSWORD", ""),
};
export const mailSender = env("MAIL_SENDER", "edegal@localhost");
export const mailFrom = env("FORMATTED_MAIL_FROM", "Edegal <edegal@localhost>");
