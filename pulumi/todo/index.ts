import * as k8s from "@pulumi/kubernetes";
import * as pulumi from "@pulumi/pulumi";
import * as gcp from "@pulumi/gcp";
import { readFileSync, fstat } from "fs";

const name = "todolist";

//GKE Cluster
const engineVersion = gcp.container.getEngineVersions().then(v => v.latestMasterVersion);
const cluster = new gcp.container.Cluster(name, {
    initialNodeCount: 3,
    minMasterVersion: engineVersion,
    nodeVersion: engineVersion,
    nodeConfig: {
        machineType: "n1-standard-1",
        oauthScopes: [
            "https://www.googleapis.com/auth/compute",
            "https://www.googleapis.com/auth/devstorage.read_only",
            "https://www.googleapis.com/auth/logging.write",
            "https://www.googleapis.com/auth/monitoring"
        ],
    },
});

export const clusterName = cluster.name;

export const kubeconfig = pulumi.
    all([ cluster.name, cluster.endpoint, cluster.masterAuth ]).
    apply(([ name, endpoint, masterAuth ]) => {
        const context = `${gcp.config.project}_${gcp.config.zone}_${name}`;
        return `apiVersion: v1
clusters:
- cluster:
    certificate-authority-data: ${masterAuth.clusterCaCertificate}
    server: https://${endpoint}
  name: ${context}
contexts:
- context:
    cluster: ${context}
    user: ${context}
  name: ${context}
current-context: ${context}
kind: Config
preferences: {}
users:
- name: ${context}
  user:
    auth-provider:
      config:
        cmd-args: config config-helper --format=json
        cmd-path: gcloud
        expiry-key: '{.credential.token_expiry}'
        token-key: '{.credential.access_token}'
      name: gcp
`;
    });

const clusterProvider = new k8s.Provider(name, { kubeconfig: kubeconfig });

// Nginx ingress
const nginxingresscntlr = new k8s.helm.v2.Chart("nginxingresscontroller", {
    repo: "stable",
    chart: "nginx-ingress",
    values: {},
}, { providers: { kubernetes: clusterProvider } });

const appLabels = { 
  "app.kubernetes.io/instance": "todo",
  "app.kubernetes.io/name": "todo"
};
const namespaceName = "default"
const appName = "todo"

const service = new k8s.core.v1.Service(name,
  {
      metadata: {
          labels: appLabels,
          namespace: namespaceName,
          name: "todo-np"
      },
      spec: {
          type: "NodePort",
          ports: [{ protocol: "TCP", nodePort: 30080, port: 80, targetPort: 5000 }],
          selector: appLabels,
      },
  },
  {
      provider: clusterProvider,
  }
);

const authContents = (readFileSync("auth.txt")).toString()

function toBase64(s: string): string {
    return Buffer.from(s).toString("base64");
}

const authContents_base64 = toBase64(authContents);

const secret = new k8s.core.v1.Secret("todo-tls", {
    metadata: { name: "basic-auth", namespace: "default" },
    type: "Opaque",
    data: {
        auth: authContents_base64,
    }
})

export const ingress = new k8s.extensions.v1beta1.Ingress(appName, {
    metadata: {
        name: appName,
        labels: appLabels,
        annotations: {
            "kubernetes.io/tls-acme": "true",
            "kubernetes.io/ingress.class": "nginx",
            "nginx.ingress.kubernetes.io/auth-type": "basic",
            "nginx.ingress.kubernetes.io/auth-secret": "basic-auth",
            "nginx.ingress.kubernetes.io/auth-realm": "Authentication Required - todo"
        },
    },
    spec: {
        rules: [{
            http: {
                paths: [{
                    path: "/",
                    backend: { serviceName: "todo-np", servicePort: 80 }
                }]
            }
        }],
        tls: [{
            secretName: "todo-tlss"
        }],
    }
}, { provider: clusterProvider });