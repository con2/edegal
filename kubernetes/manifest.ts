import { writeFileSync, unlinkSync, existsSync } from "fs";

export const stack = "edegal";

interface Environment {
  namespace: string;
  hostname: string;
  secretManaged: boolean;
  tlsEnabled: boolean;
}

type EnvironmentName = "dev" | "staging" | "conikuvat" | "larppikuvat";
const environmentNames: EnvironmentName[] = [
  "dev",
  "staging",
  "conikuvat",
  "larppikuvat",
];

const environmentConfigurations: Record<EnvironmentName, Environment> = {
  dev: {
    namespace: "default",
    hostname: "edegal.localhost",
    secretManaged: true,
    tlsEnabled: false,
  },
  staging: {
    namespace: "conikuvat-staging",
    hostname: "dev.conikuvat.fi",
    secretManaged: false,
    tlsEnabled: true,
  },
  conikuvat: {
    namespace: "conikuvat-production",
    hostname: "conikuvat.fi",
    secretManaged: false,
    tlsEnabled: true,
  },
  larppikuvat: {
    namespace: "larppikuvat",
    hostname: "larppikuvat.fi",
    secretManaged: false,
    tlsEnabled: true,
  },
};

interface Component {
  name: string;
  image: string; /// short name of image; full name managed by skaffold
  command?: string[]; /// override default command
  port?: number; /// if present, create a service
  healthCheckPath?: string; /// if present, create startup and liveness probes
  setupCommand?: string; /// if present, run in an init container
}

const components: Record<string, Component> = {
  backend: {
    name: "backend",
    image: "edegal-backend",
    port: 8000,
    healthCheckPath: "/api/v3/status",
  },
  frontend: {
    name: "frontend",
    image: "edegal-frontend",
    port: 3000,
    healthCheckPath: "/healthz",
  },
  static: {
    name: "content",
    image: "edegal-static",
    port: 80,
    // healthCheckPath: "/favicon.ico",
  },
  worker: {
    name: "worker",
    image: "edegal-backend",
    command: ["celery", "-A", "edegal_site.celery:app", "worker"],
  },
};

function getEnvironmentName(): EnvironmentName {
  const environmentName = process.env.ENV;
  if (!environmentNames.includes(environmentName as EnvironmentName)) {
    return "dev";
  }
  return environmentName as EnvironmentName;
}

const environmentConfiguration =
  environmentConfigurations[getEnvironmentName()];

const clusterIssuer = "letsencrypt-prod";
const tlsSecretName = "ingress-letsencrypt";
const { hostname, secretManaged, tlsEnabled } = environmentConfiguration;
const ingressProtocol = tlsEnabled ? "https" : "http";
const publicUrl = `${ingressProtocol}://${hostname}`;

// Startup and liveness probe
function getProbe(component: Component) {
  const { port, healthCheckPath } = component;

  if (!port || !healthCheckPath) {
    return undefined;
  }

  return {
    httpGet: {
      path: healthCheckPath,
      port,
      httpHeaders: [
        {
          name: "host",
          value: hostname,
        },
      ],
    },
  };
}

export function getLabels(component?: Component) {
  return {
    stack,
    component: component?.name,
  };
}

function getSecretKeyRef(key: string) {
  return {
    secretKeyRef: {
      name: stack,
      key,
    },
  };
}

function getEnvironment(component: Component) {
  return Object.entries({
    NEXTAUTH_SECRET: getSecretKeyRef("NEXTAUTH_SECRET"),
    NEXTAUTH_URL: publicUrl,
    NEXT_PUBLIC_EDEGAL_BACKEND_URL: publicUrl,
    KOMPASSI_OIDC_CLIENT_ID: getSecretKeyRef("KOMPASSI_OIDC_CLIENT_ID"),
    KOMPASSI_OIDC_CLIENT_SECRET: getSecretKeyRef("KOMPASSI_OIDC_CLIENT_SECRET"),
  }).map(([key, value]) => {
    if (value instanceof Object) {
      return {
        name: key,
        valueFrom: value,
      };
    } else {
      return {
        name: key,
        value: String(value),
      };
    }
  });
}

const volumes = [
  {
    name: "edegal-temp",
    emptyDir: {},
  },
];

const volumeMounts = [
  {
    name: "edegal-temp",
    mountPath: "/usr/src/app/.next/cache",
  },
];

function getDeployment(component: Component) {
  const { name, image, port } = component;

  const probe = getProbe(component);
  const probes = probe ? { livenessProbe: probe, readinessProbe: probe } : {};

  return {
    apiVersion: "apps/v1",
    kind: "Deployment",
    metadata: {
      name,
      labels: getLabels(component),
    },
    spec: {
      selector: {
        matchLabels: getLabels(component),
      },
      template: {
        metadata: {
          labels: getLabels(component),
        },
        spec: {
          enableServiceLinks: false,
          securityContext: {
            runAsUser: 1000,
            runAsGroup: 1000,
            fsGroup: 1000,
          },
          volumes,
          initContainers: [],
          containers: [
            {
              name: name,
              image,
              env: getEnvironment(component),
              ports: port ? [{ containerPort: port }] : undefined,
              securityContext: {
                readOnlyRootFilesystem: false,
                allowPrivilegeEscalation: false,
              },
              volumeMounts,
              ...probes,
            },
          ],
        },
      },
    },
  };
}

function getService(component: Component) {
  const { name, port } = component;
  return {
    apiVersion: "v1",
    kind: "Service",
    metadata: {
      name,
      labels: getLabels(component),
    },
    spec: {
      ports: [
        {
          port,
          targetPort: port,
        },
      ],
      selector: getLabels(component),
    },
  };
}

const tls = tlsEnabled
  ? [{ hosts: [hostname], secretName: tlsSecretName }]
  : undefined;

const defaultIngressAnnotations = {
  "nginx.ingress.kubernetes.io/proxy-body-size": "100m",
  "nginx.org/client-max-body-size": "100m",
};
const ingressAnnotations = tlsEnabled
  ? {
      "cert-manager.io/cluster-issuer": clusterIssuer,
      "nginx.ingress.kubernetes.io/ssl-redirect": "true",
      ...defaultIngressAnnotations,
    }
  : defaultIngressAnnotations;

function getIngressPath(path: string, component: Component) {
  return {
    path,
    pathType: "Prefix",
    backend: {
      service: {
        name: component.name,
        port: {
          number: component.port,
        },
      },
    },
  };
}

const ingress = {
  apiVersion: "networking.k8s.io/v1",
  kind: "Ingress",
  metadata: {
    name: stack,
    labels: getLabels(),
    annotations: ingressAnnotations,
  },
  spec: {
    tls,
    rules: [
      {
        host: hostname,
        http: {
          paths: [
            getIngressPath("/admin", components.backend),
            getIngressPath("/api", components.backend),
            getIngressPath("/media", components.cdn),
            getIngressPath("/static", components.cdn),
            getIngressPath("/", components.frontend),
          ],
        },
      },
    ],
  },
};

export function b64(str: string) {
  return Buffer.from(str).toString("base64");
}

// only written if secretManaged is true
const secret = {
  apiVersion: "v1",
  kind: "Secret",
  type: "Opaque",
  metadata: {
    name: stack,
    labels: getLabels(),
  },
  data: {
    KOMPASSI_OIDC_CLIENT_SECRET: b64("kompassi_insecure_test_client_secret"),
    KOMPASSI_OIDC_CLIENT_ID: b64("kompassi_insecure_test_client_id"),
    NEXTAUTH_SECRET: b64("eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee"),
  },
};

export function writeManifest(filename: string, manifest: unknown) {
  writeFileSync(filename, JSON.stringify(manifest, null, 2), {
    encoding: "utf-8",
  });
}

function main() {
  for (const component of Object.values(components)) {
    const { name } = component;
    writeManifest(`${name}-deployment.json`, getDeployment(component));
    if (component.port) {
      writeManifest(`${name}-service.json`, getService(component));
    }
  }
  writeManifest("ingress.json", ingress);

  if (secretManaged) {
    writeManifest("secret.json", secret);
  } else if (existsSync("secret.json")) {
    unlinkSync("secret.json");
  }
}

if (require.main === module) {
  main();
}
