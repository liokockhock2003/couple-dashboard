import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Prevent firebase-admin and its dependencies from being bundled on the client
  serverExternalPackages: ["firebase-admin", "@google-cloud/firestore", "@opentelemetry/api"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com", // Google profile photos
      },
    ],
  },
};

export default nextConfig;
