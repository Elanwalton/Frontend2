import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";

const remotePatterns = [
  {
    protocol: "https" as const,
    hostname: "images.unsplash.com",
  },
  {
    protocol: "http" as const,
    hostname: "localhost",
  },
];

const appendApiHostPatterns = () => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) return;

  try {
    const url = new URL(apiUrl);
    const { protocol, hostname, port } = url;

    if (!hostname) return;

    const protocols: Array<"http" | "https"> = ["http", "https"];

    protocols.forEach((proto) => {
      if (protocol && !protocol.startsWith(proto)) {
        // Always add both http and https variants to cover mixed content setups.
      }

      remotePatterns.push({
        protocol: proto,
        hostname,
        ...(port ? { port } : {}),
      });
    });
  } catch {
    // Ignore invalid URLs; keep default patterns only.
  }
};

appendApiHostPatterns();

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns,
    unoptimized: false,
  },
};

export default nextConfig;
