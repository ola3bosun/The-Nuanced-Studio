/**
 * Central Feature Flag & Site Configuration
 * 
 * Controls whether the public production site displays the temporary
 * "Redesign in Progress" interstitial or the original interactive website.
 * 
 * - In Production: Default is true (interstitial blocker active).
 *   To disable the blocker when the redesign is ready, set VITE_REDESIGN_MODE=false
 *   in the production environment or deployment settings.
 * - In Development/Staging: Set VITE_REDESIGN_MODE=false in your .env.local file
 *   to preview and develop the original site independently without altering production.
 */
export const siteConfig = {
  // Defaults to true unless explicitly set to 'false' in environment variables
  isRedesignMode: import.meta.env.VITE_REDESIGN_MODE !== 'false',
  siteTitle: "The Nuanced Studio — We're Rebuilding",
  siteDescription: "The next iteration of The Nuanced Studio is taking shape. We're rethinking the system, not just the surface.",
} as const;
