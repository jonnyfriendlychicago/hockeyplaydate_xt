import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    domains: ['lh3.googleusercontent.com' , // Google profile pictures
      's.gravatar.com',            // Gravatar profile pictures
    ], 
    
  },
};

export default nextConfig;
