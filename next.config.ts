import type { NextConfig } from "next";

/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "https://eboardapi-hsabeadsb2a8anb3.southeastasia-01.azurewebsites.net/api/:path*",
      },
    ];
  },
};

module.exports = nextConfig;

export default nextConfig;

