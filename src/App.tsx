import { siteConfig } from './config/siteConfig';
import RedesignInterstitial from './components/interstitial/RedesignInterstitial';
import OriginalSite from './components/original-site/OriginalSite';

/**
 * Root Application Router / Switcher
 *
 * Controlled centrally by `siteConfig.isRedesignMode`.
 * - In Production: Default is true (interstitial blocker active).
 *   To disable the blocker when the redesign is ready, set VITE_REDESIGN_MODE=false
 *   in your deployment environment.
 * - In Development: Set VITE_REDESIGN_MODE=false in `.env.local` to preview and develop
 *   the original website independently.
 */
export default function App() {
  if (siteConfig.isRedesignMode) {
    return <RedesignInterstitial />;
  }

  return <OriginalSite />;
}