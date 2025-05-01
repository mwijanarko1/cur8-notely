import getConfig from 'next/config';

/**
 * Get server-side runtime config
 * @returns Server runtime configuration
 */
export function getServerRuntimeConfig() {
  const { serverRuntimeConfig } = getConfig();
  return serverRuntimeConfig;
}

/**
 * Get public runtime config
 * @returns Public runtime configuration
 */
export function getPublicRuntimeConfig() {
  const { publicRuntimeConfig } = getConfig();
  return publicRuntimeConfig;
} 