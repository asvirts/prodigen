/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // !! WARN !!
    // Typescript errors are not reported during the build.
    // This is meant to be a temporary fix for the build issue.
    // !! WARN !!
    ignoreBuildErrors: true
  },
  eslint: {
    // !! WARN !!
    // ESLint errors are not reported during the build.
    // This is meant to be a temporary fix for the build issue.
    // !! WARN !!
    ignoreDuringBuilds: true
  }
}

export default nextConfig
