import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  // Pin the workspace root to this project — a stray lockfile in the
  // parent /projects directory was causing Next.js to mis-detect it.
  outputFileTracingRoot: path.join(__dirname),
};

export default nextConfig;
