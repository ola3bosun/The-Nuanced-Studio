/**
 * Editorial copy configuration for the "Redesign in Progress" lookbook poster experience.
 * Tailored for The Nuanced Studio's brand voice, visual hierarchy, and studio credentials.
 */
export interface RedesignCopyConfig {
  // Top header technical index
  systemCode: string;

  // Small brand identifier
  brandIdentifier: string;

  // Status indicator label
  statusLabel: string;

  // Primary monolithic headline - Row 1
  headlineRow1: string;

  // Primary monolithic headline - Row 2
  headlineRow2: string;

  // Caption beneath the architectural inset
  imageCaption: string;

  // Vertical spine running along the right margin
  verticalSpine: string;

  // Bold numerical badge in the lower section
  badgeNumber: string;

  // Diagnostic metadata line
  metaDiagnostic: string;

  // Editorial statements triad
  statement1: {
    label: string;
    body: string;
  };
  statement2: {
    label: string;
    body: string;
  };
  statement3: {
    label: string;
    body: string;
  };

  // Footer attribution & coordinates
  footerOrigin: string;

  // Direct studio contact / channel
  contactChannel: string;
}

export const interstitialCopy: RedesignCopyConfig = {
  systemCode: 'TNS_CORE_R200_026',
  brandIdentifier: 'THE NUANCED STUDIO®',
  statusLabel: 'REDESIGN IN PROGRESS',
  headlineRow1: "WE'RE",
  headlineRow2: 'REBUILDING.',
  imageCaption: 'the nuanced studio.',
  verticalSpine: 'THE NUANCED STUDIO®',
  badgeNumber: '02',
  metaDiagnostic: 'PHASE 02 // SYSTEM REBUILD // LAGOS',
  statement1: {
    label: 'ITERATION',
    body: 'The next iteration is taking shape.',
  },
  statement2: {
    label: 'ARCHITECTURE',
    body: "We're rethinking the system, not just the surface.",
  },
  statement3: {
    label: 'CONTINUITY',
    body: 'A new expression of the same principles.',
  },
  footerOrigin: '© TNS — LAGOS, NIGERIA',
  contactChannel: 'INFO@THENUANCEDSTUDIO.COM',
};
