import type { NextConfig } from "next"
import { withPayload } from "@payloadcms/next/withPayload"
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare"

// Next devの全VMで1つのCloudflareコンテキストを共有し、D1へ接続する
// Miniflare/workerdがページの再コンパイルごとに増えないようにする。
void initOpenNextCloudflareForDev({
  environment: process.env.CLOUDFLARE_ENV,
  remoteBindings: false,
})

const nextConfig: NextConfig = {
  images: {
    localPatterns: [
      {
        pathname: "/api/media/file/**",
      },
    ],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "picsum.photos",
      },
      {
        protocol: "https",
        hostname: "fastly.picsum.photos",
      },
    ],
  },
  // Packages with Cloudflare Workers (workerd) specific code
  // Read more: https://opennext.js.org/cloudflare/howtos/workerd
  serverExternalPackages: ["jose", "pg-cloudflare"],
  allowedDevOrigins: [
    "payload.artifacts.open.localhost",
    "storybook.payload.artifacts.open.localhost",
  ],

  // Your Next.js config here
  webpack: (webpackConfig) => {
    webpackConfig.resolve.extensionAlias = {
      ".cjs": [".cts", ".cjs"],
      ".js": [".ts", ".tsx", ".js", ".jsx"],
      ".mjs": [".mts", ".mjs"],
    }

    return webpackConfig
  },
}

export default withPayload(nextConfig, { devBundleServerPackages: false })
