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
  strokeWidth: 1.5,
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

  star: (
    <svg {...solidSvgProps} viewBox="0 0 24 24">
      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2l-2.81 6.63L2 9.24l5.46 4.73L5.82 21 12 17.27z" />
    </svg>
  ),

  favorite: (
    <svg {...solidSvgProps} viewBox="0 0 24 24">
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
    </svg>
  ),

  bolt: (
    <svg {...svgProps} viewBox="0 0 24 24">
      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
    </svg>
  ),

  check: (
    <svg {...svgProps} viewBox="0 0 24 24">
      <path d="M5 13l4 4L19 7" />
    </svg>
  ),

  close: (
    <svg {...svgProps} viewBox="0 0 24 24">
      <path d="M6 6l12 12M6 18L18 6" />
    </svg>
  ),

  chevronDown: (
    <svg {...svgProps} viewBox="0 0 24 24">
      <path d="M6 9l6 6 6-6" />
    </svg>
  ),

  chevronUp: (
    <svg {...svgProps} viewBox="0 0 24 24">
      <path d="M18 15l-6-6-6 6" />
    </svg>
  ),

  chevronLeft: (
    <svg {...svgProps} viewBox="0 0 24 24">
      <path d="M15 6l-6 6 6 6" />
    </svg>
  ),

  chevronRight: (
    <svg {...svgProps} viewBox="0 0 24 24">
      <path d="M9 6l6 6-6 6" />
    </svg>
  ),

  arrow: (
    <svg {...svgProps} viewBox="0 0 24 24">
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  ),

  arrowUp: (
    <svg {...svgProps} viewBox="0 0 24 24">
      <path d="M12 5v14M5 12l7-7 7 7" />
    </svg>
  ),

  arrowDown: (
    <svg {...svgProps} viewBox="0 0 24 24">
      <path d="M12 5v14M5 12l7 7 7-7" />
    </svg>
  ),

  search: (
    <svg {...svgProps} viewBox="0 0 24 24">
      <circle cx="11" cy="11" r="8" />
      <path d="M21 21l-4.35-4.35" />
    </svg>
  ),

  menu: (
    <svg {...svgProps} viewBox="0 0 24 24" strokeWidth={2}>
      <path d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  ),

  moreHorizontal: (
    <svg {...solidSvgProps} viewBox="0 0 24 24">
      <circle cx="5" cy="12" r="1.5" />
      <circle cx="12" cy="12" r="1.5" />
      <circle cx="19" cy="12" r="1.5" />
    </svg>
  ),

  settings: (
    <svg {...svgProps} viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="3" />
      <path d="M12 1v6m0 6v6M4.22 4.22l4.24 4.24m5.08 5.08l4.24 4.24M1 12h6m6 0h6M4.22 19.78l4.24-4.24m5.08-5.08l4.24-4.24" />
    </svg>
  ),

  success: (
    <svg {...solidSvgProps} viewBox="0 0 24 24">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 3a9 9 0 100 18 9 9 0 000-18zm4.06 6.56a.75.75 0 00-1.12-1l-3.94 4.4-1.94-1.94a.75.75 0 00-1.06 1.06l2.5 2.5a.75.75 0 001.09-.03l4.47-5z"
      />
    </svg>
  ),

  error: (
    <svg {...solidSvgProps} viewBox="0 0 24 24">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 3a9 9 0 100 18 9 9 0 000-18zm-2.47 5.47a.75.75 0 00-1.06 1.06L10.94 12l-2.47 2.47a.75.75 0 101.06 1.06L12 13.06l2.47 2.47a.75.75 0 101.06-1.06L13.06 12l2.47-2.47a.75.75 0 00-1.06-1.06L12 10.94l-2.47-2.47z"
      />
    </svg>
  ),

  warning: (
    <svg {...solidSvgProps} viewBox="0 0 24 24">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M10.29 3.86L2.07 19.05A2 2 0 003.78 22h16.44a2 2 0 001.71-2.95L13.71 3.86a2 2 0 00-3.42 0zM12 9a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0112 9zm0 9a1 1 0 100-2 1 1 0 000 2z"
      />
    </svg>
  ),

  info: (
    <svg {...solidSvgProps} viewBox="0 0 24 24">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 3a9 9 0 100 18 9 9 0 000-18zm0 4a1 1 0 100 2 1 1 0 000-2zm-.75 3.75a.75.75 0 011.5 0v5.5a.75.75 0 01-1.5 0v-5.5z"
      />
    </svg>
  ),
} as const;

export type IconName = keyof typeof icons;
