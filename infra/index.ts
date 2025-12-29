import * as pulumi from "@pulumi/pulumi";
import * as hcloud from "@pulumi/hcloud";

const config = new pulumi.Config();
const serverType = config.get("serverType") || "cx22";
const location = config.get("location") || "nbg1";
const sshKeyName = config.require("sshKeyName");

// Get existing SSH key from Hetzner
const sshKey = hcloud.getSshKeyOutput({ name: sshKeyName });

// Cloud-init script to set up Docker
const cloudInit = `#cloud-config
package_update: true
packages:
  - docker.io
  - docker-compose

runcmd:
  - systemctl enable docker
  - systemctl start docker
  - usermod -aG docker root
`;

// Create the server
const server = new hcloud.Server("app-server", {
  name: "app-server",
  serverType: serverType,
  image: "ubuntu-24.04",
  location: location,
  sshKeys: [sshKey.name],
  userData: cloudInit,
  publicNets: [{
    ipv4Enabled: true,
    ipv6Enabled: true,
  }],
});

// Create a firewall
const firewall = new hcloud.Firewall("app-firewall", {
  name: "app-firewall",
  rules: [
    {
      direction: "in",
      protocol: "tcp",
      port: "22",
      sourceIps: ["0.0.0.0/0", "::/0"],
      description: "SSH",
    },
    {
      direction: "in",
      protocol: "tcp",
      port: "80",
      sourceIps: ["0.0.0.0/0", "::/0"],
      description: "HTTP",
    },
    {
      direction: "in",
      protocol: "tcp",
      port: "443",
      sourceIps: ["0.0.0.0/0", "::/0"],
      description: "HTTPS",
    },
  ],
});

// Attach firewall to server
const firewallAttachment = new hcloud.FirewallAttachment("app-firewall-attachment", {
  firewallId: firewall.id.apply(id => parseInt(id)),
  serverIds: [server.id.apply(id => parseInt(id))],
});

// Outputs
export const serverIp = server.ipv4Address;
export const serverIpv6 = server.ipv6Address;
export const serverId = server.id;
export const serverStatus = server.status;
