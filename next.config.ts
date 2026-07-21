import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  // Pin the workspace root to this project — a stray lockfile in the
  // parent /projects directory was causing Next.js to mis-detect it.
  outputFileTracingRoot: path.join(__dirname),

  sassOptions: {
    // Auto-inject the brand tokens partial into every .scss/.module.scss
    // file so components can reference the db- prefixed variables
    // without a per-file @use. Mirrors the legacy site's reliance on
    // globally available design values (there: CSS custom properties
    // in globals.scss; here: SCSS variables in src/styles/_tokens.scss).
    includePaths: [path.join(__dirname, "src/styles")],
    additionalData: '@use "tokens" as *;',
  },
};

export default nextConfig;
