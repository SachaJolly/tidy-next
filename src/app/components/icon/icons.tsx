/**
 * Icon Registry
 * All icons are React components that return SVG elements
 * They use 'currentColor' for stroke/fill inheritance
 */

const solidSvgProps = {
  xmlns: 'http://www.w3.org/2000/svg',
  viewBox: '0 0 24 24',
  fill: 'currentColor',
} as const;

export const icons = {
  search: (
    <svg {...solidSvgProps} viewBox="0 0 24 24">
      <path fillRule="evenodd" d="m19.293 20.707-4-4 1.414-1.414 4 4z" clipRule="evenodd" />
      <path fillRule="evenodd" d="M5 11a6 6 0 1 0 12 0 6 6 0 0 0-12 0m6-8a8 8 0 1 0 0 16 8 8 0 0 0 0-16" clipRule="evenodd" />
    </svg>
  ),
} as const;

export type IconName = keyof typeof icons;
