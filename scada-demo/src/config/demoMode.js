// This copy of the SCADA app is the PUBLIC WEB DEMO hosted inside the
// portfolio website (/scada-demo/). It always runs in demo
// mode: plant config comes from the sanitized files below (every PLC register
// address blanked, no PLC IP anywhere), data is always simulated, nothing is
// fetched from or saved to a server, and plant set-up / backend-only pages are
// hidden. The full plant product lives in the separate "python scada" project.

import demoPlant from './demoPlant.json';
import demoHeader from './demoHeader.json';

export const PUBLIC_DEMO = true;

export const DEMO_USER_CFG = demoPlant;
export const DEMO_HEADER_CFG = demoHeader;

// Sidebar pages hidden in the public demo: plant set-up screens, plus the ones
// that need the real backend / PLC (Connectivity, Package Builder).
export const DEMO_HIDDEN_PAGES = new Set([
  'config',           // Plant Layout
  'tank-partitions',  // Tank Partitions
  'cross-trolley',    // Transfer Links
  'wagon-tags',       // Wagon Signals
  'tags-config',      // Tank Register
  'station-names',    // Station Parameters
  'station-cols',     // Table Columns
  'plc-test',         // Connectivity
  'app-builder',      // Package Builder
]);
