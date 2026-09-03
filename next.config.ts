import type { NextConfig } from "next"
import type { GetPlatformProxyOptions } from "wrangler"
import { withPayload } from "@payloadcms/next/withPayload"
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare"

const cloudflareDevOptions: GetPlatformProxyOptions = {
  environment: process.env.CLOUDFLARE_ENV,
  remoteBindings: false,
}

// E2E は CLOUDFLARE_PERSIST_PATH で専用のローカル D1 / R2 を使い、開発用の状態を汚さない。
// 未設定なら wrangler 既定の .wrangler/state/v3 をそのまま使う。
if (process.env.CLOUDFLARE_PERSIST_PATH) {
  cloudflareDevOptions.persist = { path: process.env.CLOUDFLARE_PERSIST_PATH }
}

// Next devの全VMで1つのCloudflareコンテキストを共有し、D1へ接続する
// Miniflare/workerdがページの再コンパイルごとに増えないようにする。
void initOpenNextCloudflareForDev(cloudflareDevOptions)

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
