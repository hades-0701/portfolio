// For building on vercel: https://github.com/Automattic/node-canvas/issues/1779
if (
  process.env.LD_LIBRARY_PATH == null ||
  !process.env.LD_LIBRARY_PATH.includes(`${process.env.PWD}/node_modules/canvas/build/Release:`)
) {
  process.env.LD_LIBRARY_PATH = `${process.env.PWD}/node_modules/canvas/build/Release:${
    process.env.LD_LIBRARY_PATH || ''
  }`
}

/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
  env: {
    BASE_URL: process.env.BASE_URL || 'http://localhost:3000',
    NEXT_APP_API_URL: process.env.NEXT_APP_API_URL,
    NEXT_APP_CANDY_MACHINE_ID: process.env.NEXT_APP_CANDY_MACHINE_ID,
    NEXT_APP_SOLANA_NETWORK: process.env.NEXT_APP_SOLANA_NETWORK,
    NEXT_APP_SOLANA_RPC_HOST: process.env.NEXT_APP_SOLANA_RPC_HOST,
    SKIP_PREFLIGHT_CHECK: process.env.SKIP_PREFLIGHT_CHECK,
  },
  webpack: config => {
    config.resolve = {
      ...config.resolve,
      fallback: {
        fs: false,
        path: false,
        os: false,
      },
    }
    return config
  },
}
