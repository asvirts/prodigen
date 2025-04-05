import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  // Disable source maps in production builds to potentially avoid the URL error
  productionBrowserSourceMaps: false
}

export default nextConfig
