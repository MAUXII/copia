import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  devIndicators: false,
  // Author pages live at /@handle, like GitHub and 21st.dev; "@folder" is reserved for parallel routes.
  async redirects() {
    return [
      { source: "/suggest", destination: "/requests", permanent: true },
      { source: "/copies", destination: "/components/copies", permanent: true },
      { source: "/components/agents", destination: "/agents", permanent: false },
    ]
  },
  async rewrites() {
    return [{ source: "/@:handle", destination: "/u/:handle" }]
  },
}

export default nextConfig
