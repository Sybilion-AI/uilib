/** Basemap and mark colours from Team-Merged globe-colors — inlined so this
 *  map does not import the globe stack. Dark tones follow the same globe
 *  night land/ocean family so canvas paint matches `html.dark`. */

export const OCEAN_TONE = '#4b88b1';
export const OCEAN_TONE_DARK = '#3a5f78';

export type MapBasemapPalette = {
  ocean: string;
  land: string;
  landStroke: string;
  graticule: string;
};

export type MapMarkColors = {
  org: string;
  chain: string;
  rim: string;
  rimSelected: string;
  arcDefault: string;
  spine: string;
};

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

export const MAP_COLORS_DARK = {
  land: '#c3cdd5',
  landStroke: 'rgba(36,40,41,0.42)',
  graticule: 'rgba(226,240,250,0.10)',
  org: '#2ec4e0',
  chain: '#8a9aa0',
  rim: '#1a2226',
  rimSelected: '#e8eef0',
  arcDefault: 'rgba(46,80,96,0.82)',
  spine: '#ff6b5a',
} as const;

export function mapBasemapPalette(dark: boolean): MapBasemapPalette {
  return dark
    ? {
        ocean: OCEAN_TONE_DARK,
        land: MAP_COLORS_DARK.land,
        landStroke: MAP_COLORS_DARK.landStroke,
        graticule: MAP_COLORS_DARK.graticule,
      }
    : {
        ocean: OCEAN_TONE,
        land: MAP_COLORS.land,
        landStroke: MAP_COLORS.landStroke,
        graticule: MAP_COLORS.graticule,
      };
}

export function mapMarkColors(dark: boolean): MapMarkColors {
  return dark ? MAP_COLORS_DARK : MAP_COLORS;
}
