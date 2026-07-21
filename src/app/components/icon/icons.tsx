/**
 * Icon Registry
 * All icons are React components that return SVG elements
 * They use 'currentColor' for stroke/fill inheritance
 */

const svgProps = {
  xmlns: 'http://www.w3.org/2000/svg',
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
} as const;

const solidSvgProps = {
  xmlns: 'http://www.w3.org/2000/svg',
  viewBox: '0 0 24 24',
  fill: 'currentColor',
} as const;

export const icons = {
  heart: (
    <svg {...solidSvgProps} viewBox="0 0 24 24">
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
    </svg>
  ),

  search: (
    <svg {...solidSvgProps} viewBox="0 0 24 24">
        <path fill-rule="evenodd" d="m19.293 20.707-4-4 1.414-1.414 4 4z" clip-rule="evenodd"/>
        <path fill-rule="evenodd" d="M5 11a6 6 0 1 0 12 0 6 6 0 0 0-12 0m6-8a8 8 0 1 0 0 16 8 8 0 0 0 0-16" clip-rule="evenodd"/>
    </svg>
  ),
} as const;

export type IconName = keyof typeof icons;
