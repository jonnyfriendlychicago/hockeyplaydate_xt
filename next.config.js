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
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'lh3.googleusercontent.com',
      's.gravatar.com',
    ],
  },
};

module.exports = nextConfig;
