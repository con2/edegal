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

/** Set in every environment once it is set at all: a bucket without keys is a misconfiguration, not a development default. */
function requiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} must be set when S3_BUCKET is set`);
  return value;
}

export const mediaRoot = env("MEDIA_ROOT", "./media");
/** URL prefix under which media storage keys are served, without trailing slash. */
export const mediaBaseUrl = env("MEDIA_BASE_URL", "/media").replace(/\/$/, "");

/**
 * S3-compatible media storage (Garage in production). An empty bucket keeps media on the
 * filesystem under `mediaRoot`. The server calls `endpoint`, which may be an in-cluster address;
 * browsers follow presigned URLs to `publicEndpoint`.
 */
const s3Bucket = env("S3_BUCKET", "");
const s3Endpoint = s3Bucket ? requiredEnv("S3_ENDPOINT") : "";
export const s3 = {
  bucket: s3Bucket,
  endpoint: s3Endpoint,
  publicEndpoint: env("S3_PUBLIC_ENDPOINT", "") || s3Endpoint,
  region: env("S3_REGION", "garage"),
  forcePathStyle: env("S3_FORCE_PATH_STYLE", "true") !== "false",
  accessKeyId: s3Bucket ? requiredEnv("S3_ACCESS_KEY_ID") : "",
  secretAccessKey: s3Bucket ? requiredEnv("S3_SECRET_ACCESS_KEY") : "",
};

export const publicUrl = env("AUTH_URL", "http://localhost:3160");
export const authSecret = secretEnv("AUTH_SECRET", "insecure-dev-secret");

export const kompassiBaseUrl = env(
  "KOMPASSI_BASE_URL",
  "https://dev.kompassi.eu",
);
export const kompassiOidc = {
  issuer: `${kompassiBaseUrl}/oidc`,
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

export const timezone = "Europe/Helsinki";

/**
 * Larpit.fi larp listing endpoint the media worker polls to fill in `eventMetadataUrl` of albums
 * that larps link to as their photos. Empty turns the sync off, as on sites other than Larppikuvat.fi.
 */
export const larpitSyncApiUrl = env("LARPIT_SYNC_API_URL", "");

/** Outgoing mail, larpit-fi style: no host means messages are logged in development and refused in production. */
export const smtp = {
  host: env("SMTP_HOSTNAME", ""),
  port: Number(env("SMTP_PORT", "587")),
  username: env("SMTP_USERNAME", ""),
  password: env("SMTP_PASSWORD", ""),
};
export const mailSender = env("MAIL_SENDER", "edegal@localhost");
export const mailFrom = env("FORMATTED_MAIL_FROM", "Edegal <edegal@localhost>");
