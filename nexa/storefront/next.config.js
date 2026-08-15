const webpack = require("webpack");

/** @type {import('next').NextConfig} */
const nextConfig = {
  // A stray package-lock.json at the repo root (outside this project)
  // otherwise makes Next.js guess the wrong workspace root — pin it
  // explicitly instead of relying on inference.
  outputFileTracingRoot: __dirname,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },
  webpack: (config) => {
    // RainbowKit's Coinbase wallet connector pulls in @coinbase/cdp-sdk,
    // which has optional imports for Coinbase's x402 payment-agent packages
    // (@x402/evm, @x402/core, @x402/svm, ...). We don't use that feature —
    // just standard wallet connect/sign/send — and those packages aren't
    // resolvable in this dependency tree, so webpack fails the build on
    // them unless we tell it to ignore them. Safe as an empty module since
    // the code path that would actually call into them is never exercised.
    config.plugins.push(new webpack.IgnorePlugin({ resourceRegExp: /^@x402\// }));
    return config;
  },
};

module.exports = nextConfig;
