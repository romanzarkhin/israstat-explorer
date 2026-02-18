import type { NextConfig } from "next";

const isGitHubPages = process.env.GITHUB_ACTIONS === "true";

const nextConfig: NextConfig = {
  output: "export",
  basePath: isGitHubPages ? "/israstat-explorer" : "",
  assetPrefix: isGitHubPages ? "/israstat-explorer/" : "",
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
