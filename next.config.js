/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
          {
            protocol: 'https',
            hostname: 'avatars.githubusercontent.com',
            port: '',
            pathname: '**'
          }
        ]
      },
    // webpack: (config, { isServer }) => {
    //   if (!isServer) {
    //     config.resolve.alias.https = "https-browserify";
    //     config.resolve.alias.http = "http-browserify";
    //     return config;
    //   }
    //   return config;
    // },
};

module.exports = nextConfig
