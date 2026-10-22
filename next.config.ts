import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  devIndicators: false,
  // Author pages live at /@handle, like GitHub and 21st.dev; "@folder" is reserved for parallel routes.
  async redirects() {
    return [{ source: "/suggest", destination: "/requests", permanent: true }]
  },
  async rewrites() {
    return [{ source: "/@:handle", destination: "/u/:handle" }]
  },
}

export default nextConfig
