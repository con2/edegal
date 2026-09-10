/**
 * Environment registry. Every process.env read in the app goes through here so the
 * deployment chart and this file are the only two places that know variable names.
 */

function env(name: string, fallback: string): string {
  return process.env[name] || fallback;
}

export const databaseUrl = env(
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
export const authSecret = env("AUTH_SECRET", "insecure-dev-secret");

export const kompassiBaseUrl = env(
  "KOMPASSI_BASE_URL",
  "https://dev.kompassi.eu",
);
export const kompassiOidc = {
  wellKnown: `${kompassiBaseUrl}/oidc/.well-known/openid-configuration/`,
  clientId: env(
    "KOMPASSI_OIDC_CLIENT_ID",
    "kompassi-dev-client-id-uusi-larppikuvat-fi",
  ),
  clientSecret: env(
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
