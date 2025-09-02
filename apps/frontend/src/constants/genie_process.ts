/**
 * Genie AO Process ID
 * This should be set via VITE_AO_TARGET_ID environment variable
 */

export const GENIE_PROCESS = import.meta.env.VITE_AO_TARGET_ID;

if (!GENIE_PROCESS) {
  throw new Error('VITE_AO_TARGET_ID environment variable is required');
}
