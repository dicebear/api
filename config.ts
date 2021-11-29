import { Config, Version } from './src/types';

const config: Config = {
  port: process.env.PORT ?? '3000',
  address: process.env.ADDRESS ?? '0.0.0.0',
  png: {
    size: {
      min: process.env.PNG_SIZE_MIN ?? '1',
      max: process.env.PNG_SIZE_MAX ?? '256',
    },
  },
  versions: [
    process.env.DISABLE_VERSION_4_4 ? undefined : import('@dicebear/api-4.4'),
    process.env.DISABLE_VERSION_4_5 ? undefined : import('@dicebear/api-4.5'),
    process.env.DISABLE_VERSION_4_6 ? undefined : import('@dicebear/api-4.6'),
    process.env.DISABLE_VERSION_4_7 ? undefined : import('@dicebear/api-4.7'),
    process.env.DISABLE_VERSION_4_8 ? undefined : import('@dicebear/api-4.8'),
    process.env.DISABLE_VERSION_4_9 ? undefined : import('@dicebear/api-4.9'),
    process.env.DISABLE_VERSION_4_10 ? undefined : import('@dicebear/api-4.10'),
    process.env.DISABLE_VERSION_5_0 ? undefined : import('@dicebear/api-5.0'),
  ].filter((v) => v) as Array<Promise<Version>>,
  cacheControl: {
    stats: process.env.CACHE_CONTROL_STATS ?? '3600', // 1 hour
    avatar: process.env.CACHE_CONTROL_AVATARS ?? '31536000', // 1 year
  },
};

export default config;
