/** Basemap and mark colours from Team-Merged globe-colors — inlined so this
 *  map does not import the globe stack. */

export const OCEAN_TONE = '#4b88b1';

export const MAP_COLORS = {
  land: '#fbfcfc',
  landStroke: 'rgba(103,119,126,0.38)',
  graticule: 'rgba(226,240,250,0.22)',
  org: '#0f9ec0',
  chain: '#54646a',
  rim: '#ffffff',
  rimSelected: '#242829',
  arcDefault: 'rgba(222,236,246,0.88)',
  spine: '#d93a2f',
} as const;
