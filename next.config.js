// // import type { NextConfig } from "next";

// // const nextConfig: NextConfig = {
//   const nextConfig = {
//   /* config options here */
//   images: {
//     domains: ['lh3.googleusercontent.com' , // Google profile pictures
//       's.gravatar.com',            // Gravatar profile pictures
//     ], 
//   },

//   experimental: {
//     // Prevent Next.js from modifying tsconfig.json
//     tsconfigMetadata: false,
//     // red squiggle on tsconfigMetadata in line above: Object literal may only specify known properties, and 'tsconfigMetadata' does not exist in type 'ExperimentalConfig'.ts(2353)
//     typedRoutes: false, // Optional, disables other experimental route typings
//   },
// };

// export default nextConfig;

// above replaced by below

// NOTE: 2025apr07
      // In a TypeScript-based Next.js project, the correct default is:
      // next.config.js 
      // Even in a TypeScript project, Next.js expects the config file to be JavaScript, not TypeScript.

      // Why not next.config.ts?
      // Next.js does not officially support next.config.ts as of Next 14.x or 15.x.

      // You can get it working with extra setup (like next-plugin-transpile-modules or a custom build script), but it's not recommended.

/** @type {import('next').NextConfig} */
const nextConfig = {

  // experimental: {
  //   tsconfigMetadata: false, // prevent Next.js from rewriting tsconfig.json
  // },

  images: {

    // domains: [
    //   'lh3.googleusercontent.com',
    //   's.gravatar.com',
    // ],
    // 2025apr07: above replaced by below, to address this message in terminal:  The "images.domains" configuration is deprecated. Please use "images.remotePatterns" configuration instead
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com', // Google profile pics
      },
      {
        protocol: 'https',
        hostname: 's.gravatar.com', // Gravatar profile pics
      },
    ],

  },
};

module.exports = nextConfig;
