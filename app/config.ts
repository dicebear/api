import { Config, Version } from '../types';
import { env } from './src/utils/env.js';

const versions: Array<Promise<Version>> = [];

env('ENABLE_VERSION_4_4', '1') && versions.push(import('@dicebear/api-4.4'));
env('ENABLE_VERSION_4_5', '1') && versions.push(import('@dicebear/api-4.5'));
env('ENABLE_VERSION_4_6', '1') && versions.push(import('@dicebear/api-4.6'));
env('ENABLE_VERSION_4_7', '1') && versions.push(import('@dicebear/api-4.7'));
env('ENABLE_VERSION_4_8', '1') && versions.push(import('@dicebear/api-4.8'));
env('ENABLE_VERSION_4_9', '1') && versions.push(import('@dicebear/api-4.9'));
env('ENABLE_VERSION_4_10', '1') && versions.push(import('@dicebear/api-4.10'));
env('ENABLE_VERSION_5_0', '1') && versions.push(import('@dicebear/api-5.0'));

const config: Config = {
  port: parseInt(env('PORT', '3000')),
  address: env('ADDRESS', '0.0.0.0'),
  logger: env('ENABLE_LOGGER', '0') === '1',
  png: {
    enabled: env('ENABLE_PNG', '1') === '1',
    size: {
      min: parseInt(env('PNG_SIZE_MIN', '1')),
      max: parseInt(env('PNG_SIZE_MAX', '256')),
    },
    exif: env('ENABLE_PNG_EXIF', '0') === '1',
  },
  jpeg: {
    enabled: env('ENABLE_JPEG', '1') === '1',
    size: {
      min: parseInt(env('JPEG_SIZE_MIN', '1')),
      max: parseInt(env('JPEG_SIZE_MAX', '256')),
    },
    exif: env('ENABLE_JPEG_EXIF', '0') === '1',
  },
  versions,
  cacheControl: {
    avatar: parseInt(env('CACHE_CONTROL_AVATARS', '31536000')), // 1 year
  },
};

export default config;
