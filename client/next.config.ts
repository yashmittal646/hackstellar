import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow the phone on the same LAN to access the dev server
  allowedDevOrigins: ["192.168.1.13", "192.168.0.*", "10.0.0.*", "172.16.*"],

  // Proxy all /api/* requests to the backend.
  // Phone calls https://[laptop-ip]:3000/api/... → Next.js → localhost:5000
  async rewrites() {
    const backendUrl = process.env.BACKEND_URL || "http://localhost:5000";
    return [
      {
        source: "/api/:path*",
        destination: `${backendUrl}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
