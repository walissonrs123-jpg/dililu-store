import type { NextConfig } from "next";

const config: NextConfig = {
  output: "export",
  trailingSlash: false,
  images: { unoptimized: true },
  poweredByHeader: false,
  experimental: { cpus: 2 },
};

export default config;
